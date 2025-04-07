<?php

namespace app\common\ws\serials;

use app\models\ws\serials\Log;
use app\models\ws\serials\SerialNumber;
use Exception;
use Yii;
use yii\helpers\Url;
use yii\db\Expression;
use SoapFault;

/**
 * Веб-сервис "База серийных номеров"
 *
 * 1. Добавление информации о запросе в лог таблицу БД.
 * 2. Сохранение запроса во временный файл.
 * 3. Сохранение информации о запросе в лог файл.
 * 4. Обработка запроса (удаление и/или обновление записей в БД).
 * 5. Запись в лог таблицу, количества добавленных и удалённых записей.
 * 6. Удаление временного файла с запросом (п.2).
 *
 */
class ServiceSN
{
    public const FILES_PATH = '/web/files/serials/';
    public const FILES_URL = 'files/serials/';

    private const ACTION_UPDATE = 1;
    private const ACTION_DELETE = 0;

    private $addedCount = 0;
    private $deletedCount = 0;

    /**
     * @param Request $request
     * @return Response
     */
    public function handleRequest(Request $request)
    {
        $response = new Response;
        
        try {
            if (
                count($request->body['subAccounts']['subAccountsTypeElement'])
                && !isset($request->body['subAccounts']['subAccountsTypeElement'][0]))
            {
                $request->body['subAccounts']['subAccountsTypeElement'] = [$request->body['subAccounts']['subAccountsTypeElement']];
            }

            $fileName = $this->generateFileName();

            $logId = $this->addLog($request, $fileName);

            $this->saveToFile($fileName, serialize($request->body));

            $this->logRequestToFile($request);

            $this->handleAction($request);

            $this->updateLog($logId);

            $response->errorDesc = 'tmp_file_href=' . $this->generateWebPath($fileName);
            $response->insertCount = $this->addedCount;
            $response->deleteCount = $this->deletedCount;
        } catch (Exception $e) {
            $this->addLog($request, $e->getMessage());

            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . ' ' . $e->getMessage() . "\n" . $e->getTraceAsString());

            throw new SoapFault('CLIENT', $e->getMessage());
        }

        return $response;
    }

    private function addLog(Request $request, string $fileName): int
    {
        $log = new Log;
        $log->ins_date = new Expression('NOW()');
        $log->updateId = $request->body['updateId'] ?? "";
        $log->updateType = $request->body['updateType'] ?? "";
        $log->file_name = $fileName;
        $log->file_size = count($request->body['subAccounts']['subAccountsTypeElement']);
        $log->save();

        // last insert id
        return $log->id;
    }

    private function updateLog(int $logId)
    {
        $log = Log::findOne($logId);

        if ($log !== null) {
            $log->insert_count = $this->addedCount;
            $log->delete_count = $this->deletedCount;
            $log->save();
        }
    }
    
    private function handleAction(Request $request)
    {
        if ($request->body['updateType'] == self::ACTION_UPDATE) {
            foreach($request->body['subAccounts']['subAccountsTypeElement'] as $subAccount) {
                $this->updateSn($subAccount, $request->body['updateId'], $request->body['updateTime']);
            }
        } elseif ($request->body['updateType'] == self::ACTION_DELETE) {
            foreach($request->body['subAccounts']['subAccountsTypeElement'] as $subAccount) {
                $this->deleteSn($subAccount['id']);
            }
        }
    }
    
    private function deleteSn(int $id)
    {
        // при удалении деактивируем для истории
        $model = SerialNumber::findOne($id);

        if ($model !== null) {
            $model->disabled = SerialNumber::STATUS_DISABLED;
            $model->save();

            $this->deletedCount++;
        }
    }

    private function updateSn(array $subAccount, int $updateId, string $updateTime)
    {   
        SerialNumber::deleteAll("id = {$subAccount['id']}");

        $sn = new SerialNumber;
        $sn->id = $subAccount['id'];
        $sn->accountNumber = $subAccount['accountNumber'];
        $sn->subAccountNumber = $subAccount['subAccountNumber'];
        $sn->subAccountType = $subAccount['subAccountType'];
        $sn->updateId = $updateId;
        $sn->updateTime = $updateTime;
        $sn->save();

        $this->addedCount++;
    }

    private function logRequestToFile(Request $request)
    {
        $data =
            str_repeat('*', 3) . date('Y-m-d H:i:s') . str_repeat('*', 3) . "\r\n" .
            join(' | ', [
                $request->body['updateId'],
                $request->body['updateTime'],
                $request->body['updateType'],
                count( $request->body['subAccounts']['subAccountsTypeElement'] )
            ]) . "\r\n\r\n";

        $f = fopen($this->generateFilePath('serials.log'), 'ab+');
        fwrite($f, $data);
        fclose($f);
    }

    private function generateFileName(): string
    {
        return 'db_sn_' . date('Ymd_His') . '_' . random_int(0, PHP_INT_MAX) . '.xml';
    }

    private function generateFilePath(string $fileName): string
    {
        return Yii::$app->basePath . self::FILES_PATH . $fileName;
    }

    private function generateWebPath(string $fileName): string
    {
        return Url::home(true) . self::FILES_URL . $fileName;
    }

    private function saveToFile(string $fileName, string $data)
    {
        if ( !($f = fopen( $this->generateFilePath($fileName), 'wb+')) ) {
            throw new Exception("cannot write file: '$fileName'");
        }
        fwrite($f, $data);
        fclose($f);
    }

    private function deleteFile(string $fileName)
    {
        $file = $this->generateFilePath($fileName);
        if (is_file($file)) {
            unlink($file);
        }
    }
}
