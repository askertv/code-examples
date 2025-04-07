<?php
namespace app\commands;

use app\commands\traits\ConsoleLoggerTrait;

use app\models\microservice\AskForm;
use app\models\microservice\MicroserviceForm;
use app\models\microservice\InviteForm;
use app\models\microservice\LeadForm;

use yii\console\Controller;
use yii\db\ActiveRecord;
use app\common\microservice\ServiceCRM as Service;

use Exception;
use Yii;

class MicroserviceController extends Controller
{
    const ACTION_TYPE_SEND = 'send';
    const ACTION_TYPE_MONITORING = 'monitoring';

    private $downloadedFiles = [];
    private $unDownloadedFiles = [];
    private $uploadPath;
    private $isSuccess = true;

    private $systemFields = [
        'url' => 'URL страницы, с которой отправлена форма',
        'query' => 'Query string',
        'cookies' => 'Значения cookies: __utmz, _ga'
    ];
    
    private $fieldsTranslation = [
        'name' => 'name',
        'phone' => 'telephone',
        'email' => 'email',
        'd_code' => 'code',
        'inn' => 'code',
        'company' => 'companyname',
        'p_sector' => 'classification',
        'product' => 'detalization',
        'question' => 'description',
        'url' => 'url',
        'query' => 'query',
        'cookies' => 'cookies',

        // Пока не утверждено (2019-08-30 16:28)
        'position' => 'position',
        'pdata_agreement' => 'pdata_agreement',
        'event_name' => 'event_name'
    ];

    private $subjectByType = [
        AskForm::FORM_TYPE => AskForm::EMAIL_SUBJECT,
        InviteForm::FORM_TYPE => InviteForm::EMAIL_SUBJECT,
        LeadForm::FORM_TYPE => LeadForm::EMAIL_SUBJECT
    ];

    public $act;
    public $ids;
    public $notify;

    use ConsoleLoggerTrait;

    public function options($actionID)
    {
        return ['ids', 'act', 'notify'];
    }

    public function actionIndex()
    {
        $this->info("MicroserviceController::actionIndex Start");
        
        if (empty($this->act)) {
            $this->error("MicroserviceController::actionIndex Error: missing parameter act");
        } else {
            $this->tryAct($this->act, $this->ids);
        }

        $this->info("MicroserviceController::actionIndex Finish");
    }

    private function tryAct($act, $ids = '')
    {
        if ($act == self::ACTION_TYPE_SEND) {
            $this->sendIntoMicroservice($ids);
        } elseif ($act == self::ACTION_TYPE_MONITORING) {
            $this->checkMicroserviceAccessible();
        } else {
            $this->error("MicroserviceController::tryAct Error: unsupported action: '$act'");
        }
    }

    private function sendIntoMicroservice(string $ids = '')
    {
        try {
            if (!empty($ids)) {
                $rowIds = explode(',', $ids);
                
                $this->info("MicroserviceController::sendIntoMicroservice ids");
                $this->info(print_r($rowIds, true));

                $storage =
                    new class extends ActiveRecord
                    {
                        public static function tableName(): string
                        {
                            return '{{%microservice_form}}';
                        }
                    
                        public static function primaryKey()
                        {
                            return ["id"];
                        }
                    };
                
                foreach ($rowIds as $rowId) {
                    $this->info("id: '$rowId'");
                    
                    $record = $storage->findOne($rowId);
                    
                    $req = [];
                    foreach($this->fieldsTranslation as $dbField => $microserviceField) {
                        if ($record->$dbField) {
                            $req[$microserviceField] = $record->$dbField;
                        }
                    }
                    
                    if ($record->d_code && $record->inn) {
                        $req['code'] = $record->d_code ? $record->d_code : $record->inn;
                    }
                    
                    foreach ($this->systemFields as $field => $title) {
                        $microserviceField = $this->fieldsTranslation[$field];
                        $req[$microserviceField] = $record->{$field};
                    }
        
                    // ms dynamics пока что не хочет сохранять эти параметры
                    unset($req['pdata_agreement']);
                    unset($req['event_name']);
                    unset($req['position']);

                    $subject = $this->subjectByType[$record->type] ?? 'Запрос с типом "' . $record->type . '"';
                    $subject .= ' (' . Yii::$app->params['contour.name'] . ')';

                    try {
                        $microserviceService = new Service;
                        Yii::info("MicroserviceController::sendIntoMicroservice start send message:\n" . print_r($req, true));
                        $response = $microserviceService->createNotificationFromSite($req);
                        // сохранить ответ "$response" в таблицу с запросом. Флаг успешности "Y"
                        $record->status = 'Y';
                        $record->response = $response;
                        $record->update();

                        // оповестить по email
                        MicroserviceForm::sendEmail(print_r($req, true), $subject, Yii::$app->params['microservice_email_requests']);
                        Yii::info("MicroserviceController::sendIntoMicroservice message is sended");
                    } catch (Exception $e) {
                        $errorTxt = $e->getMessage() . "\n" . $e->getTraceAsString();
                        Yii::error("MicroserviceController::sendIntoMicroservice " . $errorTxt);
                        // сохранить ответ в таблицу с запросом. Флаг успешности "N"
                        $record->status = 'N';
                        $record->response = $errorTxt;
                        $record->update();
                        // оповестить по email
                        MicroserviceForm::sendEmail(print_r($req, true) . "\n\n" . $errorTxt, $subject, Yii::$app->params['microservice_email_requests']);
                    }
                }
            }
        } catch (Exception $e) {
            $this->error("MicroserviceController::sendIntoMicroservice Error", $e);
            $this->error(print_r($e, true));
        }
    }

    private function checkMicroserviceAccessible()
    {
        $subject = 'Мониторинг работы интеграции сайта';
        $subject .= ' (' . Yii::$app->params['contour.name'] . ') с Microservice:';
        try {
            $this->info("MicroserviceController::checkMicroserviceAccessible monitoring start");
            $microserviceService = new Service;
            $response = $microserviceService->getMessagesFromSite();
            Yii::info("MicroserviceController::checkMicroserviceAccessible response:");
            Yii::info($response);

            // оповестить по email
            if ($this->notify == 'any') {
                MicroserviceForm::sendEmail($response, $subject . ' Норм');
            }

            $this->info("MicroserviceController::checkMicroserviceAccessible monitoring finish");
        } catch (Exception $e) {
            $errorTxt = $e->getMessage() . "\n" . $e->getTraceAsString();
            Yii::error("MicroserviceController::checkMicroserviceAccessible " . $errorTxt);
            // оповестить по email
            MicroserviceForm::sendEmail($errorTxt, $subject . ' Ошибка');
        }
    }
}
