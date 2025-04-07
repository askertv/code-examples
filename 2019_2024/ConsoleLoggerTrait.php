<?php
namespace app\commands\traits;

trait ConsoleLoggerTrait
{

    public $allMsgs = array();

    public function info($msg = '', \Exception $e = null)
    {
        $msg = empty($e) ? $msg : $msg . $e->getMessage() . "\n" . $e->getTraceAsString();
        echo ('INFO ' . date("Y-m-d H:i:s ") . $msg . "\n");
        $this->allMsgs[] = 'INFO ' . date("Y-m-d H:i:s ") . $msg;
        \Yii::info($msg);
    }

    public function error($msg = '', \Exception $e = null)
    {
        $msg = empty($e) ? $msg . "\n" : $msg . $e->getMessage() . "\n" . $e->getTraceAsString();
        echo ('ERROR ' . date("Y-m-d H:i:s ") . $msg . "\n");
        $this->allMsgs[] = 'ERROR ' . date("Y-m-d H:i:s ") . $msg;
        \Yii::error($msg);
    }

    public function warn($msg = '', \Exception $e = null)
    {
        $msg = empty($e) ? $msg . "\n" : $msg . $e->getMessage() . "\n" . $e->getTraceAsString();
        echo ('WARN ' . date("Y-m-d H:i:s ") . $msg . "\n");
        $this->allMsgs[] = 'WARN ' . date("Y-m-d H:i:s ") . $msg;
        \Yii::warning($msg);
    }
}
