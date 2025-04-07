<?php
namespace app\common\crm;

use Exception;
use Yii;
use GuzzleHttp\Client as HttpClient;

/**
 * Работа с Microsoft Dynamics через Веб-API
 */
class ServiceCRM
{
    const REQUEST_METHOD_GET = 'GET';
    const REQUEST_METHOD_POST = 'POST';

    // Обращение с сайта
    const ACTION_CREATE_NOTIFICATION_FROM_SITE = 'create_notification_from_site';
    
    // Получение обращений с сайта
    const ACTION_MESSAGES_SELECT = 'messages?\$select=site_cookies,site_url,site_query,createdon,description,title&\$filter=Microsoft.Dynamics.CRM.Today(PropertyName=@p1)&@p1=\'createdon\'';

    /**
     * Создать сообщение в CRM
     */
    public function createNotificationFromSite(array $data): string
    {
        $response = $this->request(
            self::ACTION_CREATE_NOTIFICATION_FROM_SITE,
            self::REQUEST_METHOD_POST,
            $data,
            $useSystemExec = true
        );

        Yii::info("CRM Service::createNotificationFromSite response:\n" . $response);

        return $response;
    }

    /**
     * Прочитать сообщения из CRM созданные сегодня ( &$filter=Microsoft.Dynamics.CRM.Today(PropertyName=@p1)&@p1='createdon' )
     */
    public function getMessagesFromSite(): string
    {
        $response = $this->request(
            self::ACTION_MESSAGES_SELECT,
            self::REQUEST_METHOD_GET,
            [],
            $useSystemExec = true
        );

        Yii::info("CRM Service::getMessagesFromSite response:\n" . $response);

        return $response;
    }

    private function request(string $action, string $requestMethod, array $data, bool $useSystemExec = false): string
    {
        $user = Yii::$app->params['crm.user'];
        $password = Yii::$app->params['crm.password'];
        $url = Yii::$app->params['crm.url'] . $action;

        if ($useSystemExec) {
            $klistStatus = `klist -s; echo $?`; // https://stackoverflow.com/a/68733854

            if ((int)$klistStatus !== 0) {
                `echo '$password' | kinit $user`;

                // Повторная проверка
                $klistStatus = `klist -s; echo $?`;

                if ((int)$klistStatus !== 0) {
                    throw new Exception('Error Kerberos init (kinit)');
                }
            }

            $command = "curl \"$url\" --negotiate -u $user:'$password' -k";

            if ($requestMethod === self::REQUEST_METHOD_POST) {
                $dataJson = json_encode($data);
                $command .= " -X $requestMethod -H 'Content-Type: application/json' -d '$dataJson'";
            }

            $responseJson = `$command`;

            if ($responseJson == '' || stristr($responseJson, 'HTTP Error')) {
                $errorMessage = !empty($responseJson) ? $responseJson : "Empty response from CRM ( $url )";
                throw new Exception($errorMessage);
            }
        } else {
            $client = new HttpClient;

            $responseStream = $client->request(
                $requestMethod,
                $url,
                [
                    'auth' => [$user, $password, 'ntlm'],
                    'json' => $data
                ]
            );

            $responseJson = $responseStream->getBody();
        }

        $responseArray = json_decode($responseJson, true);
        $responseStr = print_r($responseArray, true);
        return $responseStr;
    }
}
