<?php

namespace app\common;

use app\models\CMPAuthCodes;
use Yii;
use Exception;
use Throwable;
use yii\db\Expression;
use GuzzleHttp\Client as HttpClient;
use GuzzleHttp\Exception\GuzzleException;

/**
 * Взаимодействие с API КМП
 */
class CMPService
{
    const HTTP_CODE_OK = 200;
    const HTTP_CODE_I_AM_A_TEAPOT = 418;
    const HTTP_CODE_NOT_FOUND = 404; 

    private $availableLinkTypes = [
        CMPAuthCodes::LINK_TYPE_SMS,
        CMPAuthCodes::LINK_TYPE_TOKEN
    ];

    /**
     * Создание ссылки для подписи по СМС
     *
     * @return string
     */
    public function makeSmsLink(): string
    {
        return $this->makeLink(CMPAuthCodes::LINK_TYPE_SMS);
    }

    /**
     * Создание ссылки для подписи по токену
     *
     * @return string
     */
    public function makeTokenLink(): string
    {
        return $this->makeLink(CMPAuthCodes::LINK_TYPE_TOKEN);
    }

    /**
     * Пересылка кода авторизации от КМП в мидлваре
     *
     * @param string $code Код авторизации от КМП
     * @param string $state Уникальное число для контроля запросов
     * @param string $nonce Уникальное число для контроля запросов
     */
    public function transitAuthCode(string $code, string $state, string $nonce)
    {        
        if (!$code) {
            return;
        }

        $data =
            CMPAuthCodes::find()
                ->where(['state' => $state, 'nonce' => $nonce, 'code_is_set' => 0])
                ->limit(1)
                ->one();

        if ($data === null) {
            return;
        }

        $rowId = $data->id;

        $sendingResultCode = $this->sendToMiddleware($code);

        if ($sendingResultCode === self::HTTP_CODE_OK) {
            $this->completeAuthCode($rowId);
        }
    }

    /**
     * Создание ссылки для подписи
     *
     * @return string
     */
    private function makeLink(string $linkType): string
    {
        $this->validateLinkType($linkType);

        $result = '#';

        $transaction = Yii::$app->db->beginTransaction();
        try {
            $state = $this->generateUid();
            $nonce = $this->generateUid();

            $model = new CMPAuthCodes;
            $model->state = $state;
            $model->nonce = $nonce;
            $model->link_type = $linkType;
            $model->ip = Yii::$app->request->userIP;
            $model->user_agent = Yii::$app->request->userAgent;
            $model->save();

            $url = Yii::$app->params['cmp.sms.url'];
            if ($linkType === CMPAuthCodes::LINK_TYPE_TOKEN) {
                $url = Yii::$app->params['cmp.token.url'];
            }

            $result = "$url&state=$state&nonce=$nonce";

            $transaction->commit();
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Ссылка для подписи по $linkType создана: $result");
        } catch(Exception $e) {
            $transaction->rollBack();
            $result = "Ошибка создания ссылки подписи по $linkType";
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . " $result ". $e->getMessage() . "\n" . $e->getTraceAsString());
        } catch(Throwable $e) {
            $transaction->rollBack();
            $result = "Ошибка создания ссылки подписи по $linkType";
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . " $result ". $e->getMessage() . "\n" . $e->getTraceAsString());
        }

        return $result;
    }

    /**
     * Возвращает уникальное значение
     */
    private function generateUid(): string
    {
        // Можно поменять на что то другое, но уникальное значение
        return trim(file_get_contents('/proc/sys/kernel/random/uuid'));
    }

    private function validateLinkType(string $linkType)
    {
        if (!$this->isAvailableLinkType($linkType)) {
            throw new Exception("Wrong link type: '$linkType'");
        }
    }

    private function isAvailableLinkType(string $linkType): bool
    {
        return in_array($linkType, $this->availableLinkTypes);
    }

    private function sendToMiddleware(string $authCode): int
    {
        $resultCode = self::HTTP_CODE_I_AM_A_TEAPOT;

        $url = Yii::$app->params['cmp.middleware.url'];

        try {
            $client = new HttpClient;

            $responseStream = $client->request(
                'POST',
                $url,
                [
                    'body' => '{"code":"' . $authCode . '"}',
                    'headers' => [
                        'Content-type' => 'text/plain'
                    ]
                ]
            );

            $resultCode = $responseStream->getStatusCode();
        } catch(GuzzleException $e) {
            $resultCode = self::HTTP_CODE_NOT_FOUND;
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . $e->getMessage() . "\n" . $e->getTraceAsString());
        }

        return $resultCode;
    }

    private function completeAuthCode(int $rowId)
    {
        $authCode = CMPAuthCodes::findOne($rowId);
        $authCode->code_is_set = 1;
        $authCode->date_response = new Expression('NOW()');
        $authCode->save();
    }
}
