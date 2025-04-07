<?php

namespace app\controllers;

use Throwable;
use Exception;
use Yii;
use yii\web\Controller;
use yii\filters\VerbFilter;
use app\common\CMPService as Service;

/**
 * Взаимодействие с API КМП
 */
class CMPController extends Controller
{
    /**
     * @inheritdoc
     */
    public function beforeAction($action)
    {
        $this->enableCsrfValidation = false;

        return parent::beforeAction($action);
    }

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'get-sms-link' => ['POST'],
                    'get-token-link' => ['POST'],
                ]
            ]
        ];
    }

    /**
     * Отображение кнопок генерации ссылок для АПИ КМП
     *
     * @return string
     */
    public function actionIndex(): string
    {
        return $this->render('index');
    }

    /**
     * Генерация ссылки для СМС
     *
     * @return string
     */
    public function actionGetSmsLink(): string
    {
        return (new Service)->makeSmsLink();
    }

    /**
     * Генерация ссылки для токена
     *
     * @return string
     */
    public function actionGetTokenLink(): string
    {
        return (new Service)->makeTokenLink();
    }

    /**
     * Отправка кода авторизации от КМП в мидлваре
     */
    public function actionTransitCode()
    {
        $code = Yii::$app->request->post('code', '');
        $state = Yii::$app->request->post('state', '');
        $nonce = Yii::$app->request->post('nonce', '');

        (new Service)->transitAuthCode($code, $state, $nonce);
    }
}
