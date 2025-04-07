<?php

namespace app\common;

use Exception;
use app\common\exception\StatusException;
use Yii;
use yii\helpers\ArrayHelper;
use yii\db\Expression;
use app\models\npaNews\JournalContent;
use app\models\npaNews\Administrator;
use app\models\npaNews\BlockUserRole;
use app\models\npaNews\InfBlock;
use app\models\npaNews\Resolution;
use app\models\npaNews\State;
use app\models\npaNews\ContentMap;
use app\models\npaNews\News;
use app\models\npaNews\NewsTheme;
use yii\db\ActiveRecord;

/**
 * Приемник новостей на сайте
 *
 * Заливает в NEWS тестовую и рабочую версии русской и английской новостей.
 * Добавляет в CONTENT_MAP привязки основного и доп. блоков.
 * Добавляет в RESOLUTION резолюции рабочей русской и английской новостей.
 * Выполняет проверки существования: администратора, новостной темы, блока, статусов.
 *
 * Для правильной обработки ошибок при публикации новостей, возможны следующие варианты ответа в элементе status:
 *    Строка ответа начинается с «ДОБАВЛЕНА» - размещение прошло успешно; 
 *    Строка ответа начинается с «ДУБЛЬ» - дубль новости, повторная отправка не нужна; (Нужно сделать проверку на дубли)
 *    Строка ответа начинается с «ОШИБКА» - ошибка размещения новости, необходима повторная отправка новости; (Выдавать только если новость не записалась в базу.)
 */

class NpaNewsReceiver
{
    public const FILES_PATH = '/web/files/npa/';
    public const FILES_URL = 'files/npa/';

    private const NEWS_VERSION_TEST = 1;
    private const NEWS_VERSION_PROD = 0;

    public const LANG_ID_RU = 1;
    public const LANG_ID_EN = 2;

    private const ACTION_ADD = 'ADD';
    private const DEFAULT_NEWS_DATE = '04.08.2004 18:51';
    private const STR_VALUE_YES = 'Y';

    private const PRG_MODULE_NEWS = 22;
    private const STATUS_GRAPH_ID_RU = 186;
    private const STATUS_GRAPH_ID_EN = 187;

    private const JOURNAL_CONTENT_OPERATION_TYPE_ADD = 1;

    private const PATTERN_DATETIME_FORMAT = '/^(\d\d)\.(\d\d)\.(\d\d\d\d) (\d\d):(\d\d)$/';

    private const RESPONSE_TEXT_NEWS_ADDED = 'ДОБАВЛЕНА';
    private const RESPONSE_TEXT_DUPLICATE_NEWS = 'ДУБЛЬ';
    private const RESPONSE_TEXT_ERROR = 'ОШИБКА';

    /** @var string */
    private $action;

    /** @var integer */
    private $newsThemeId;

    /** @var string */
    private $login;

    /** @var string */
    private $passwordHash;

    /** @var string */
    private $newsDate;

    /** @var string */
    private $pubDate;

    /** @var integer */
    private $importance;

    /** @var string */
    private $titleRu;

    /** @var string */
    private $titleEn;

    /** @var string */
    private $announceRu;

    /** @var string */
    private $announceEn;

    /** @var string */
    private $bodyRu;

    /** @var string */
    private $bodyEn;

    /** @var integer */
    private $forQiOnly;

    /** @var integer */
    private $stateRu;

    /** @var integer */
    private $stateEn;

    /** @var string */
    private $mainInfBlock;

    /** @var string */
    private $infBlockList;

    /** @var array */
    private $customInfoBlocks = [];

    /** @var array */
    private $selectedCustomInfoBlock = [];

    /** @var integer */
    private $timeStamp;

    /** @var bool */
    private $isNewsCreated;

    public function __construct()
    {
        $this->customInfoBlocks = Yii::$app->npa->tables;
    }

    public function handleRequest(array $data): string
    {
        $response = self::RESPONSE_TEXT_ERROR;

        try {
            $this->readInputData($data);

            $this->logRequestData();

            if ($this->action !== self::ACTION_ADD) {
                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_ERROR . ": Неверный action: '{$this->action}'");

                throw new StatusException(self::RESPONSE_TEXT_ERROR);
            }

            if (!$this->checkUser()) {
                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_ERROR . ': Неверный логин или пароль');

                throw new StatusException(self::RESPONSE_TEXT_ERROR);
            }

            if ($this->newsThemeId && !$this->newsThemeExists($this->newsThemeId)) {
                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_ERROR . ': Несуществующая тема');

                throw new StatusException(self::RESPONSE_TEXT_ERROR);
            }

            if (!$this->mainInfBlockExists()) {
                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_ERROR . ': Несуществующий инф. блок');

                throw new StatusException(self::RESPONSE_TEXT_ERROR);
            }

            $this->timeStamp = time();

            if ($this->isCustomNews()) {
                $this->addCustomNews();
            } else {
                $this->addNews();
            }

            if ($this->isNewsCreated) {
                $response = self::RESPONSE_TEXT_NEWS_ADDED;
            }
        } catch (StatusException $e) {
            $response = $e->getMessage();
        } catch (Exception $e) {
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . ' ' . $e->getMessage() . "\n" . $e->getTraceAsString());
        }

        Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . $response);

        return $response;
    }

    private function readInputData(array $data)
    {
        $this->action = ArrayHelper::getValue($data, 'ACTION', '');
        $this->newsThemeId = (int)ArrayHelper::getValue($data, 'NEWS_THEME_ID', 0);
        $this->login = ArrayHelper::getValue($data, 'LOGIN', '');
        $this->passwordHash = ArrayHelper::getValue($data, 'PASSWORD', '');

        if ($this->passwordHash !== '') {
            $this->passwordHash = md5($this->passwordHash);
        }

        $this->newsDate = ArrayHelper::getValue($data, 'NEWS_DATE', self::DEFAULT_NEWS_DATE);
        $this->pubDate = ArrayHelper::getValue($data, 'PUB_DATE', self::DEFAULT_NEWS_DATE);
        $this->importance = (int)ArrayHelper::getValue($data, 'IMPORTANCE', 0) === 1 ? 0 : 1;
        $this->titleRu = ArrayHelper::getValue($data, 'TITLE_RU', '');
        $this->titleEn = ArrayHelper::getValue($data, 'TITLE_EN', '');
        $this->announceRu = ArrayHelper::getValue($data, 'ANNOUNCE_RU', '');
        $this->announceEn = ArrayHelper::getValue($data, 'ANNOUNCE_EN', '');
        $this->bodyRu = ArrayHelper::getValue($data, 'BODY_RU', '');
        $this->bodyEn = ArrayHelper::getValue($data, 'BODY_EN', '');
        $this->forQiOnly = ArrayHelper::getValue($data, 'FOR_QI_ONLY', '') === self::STR_VALUE_YES ? 1 : 0;
        $this->stateRu = (int)ArrayHelper::getValue($data, 'STATE_RU', 0);
        $this->stateEn = (int)ArrayHelper::getValue($data, 'STATE_EN', 0);
        $this->mainInfBlock = ArrayHelper::getValue($data, 'MAIN_INF_BLOCK', '');
        $this->infBlockList = ArrayHelper::getValue($data, 'INF_BLOCK_LIST', []);
        
        if (!empty($this->customInfoBlocks[$this->mainInfBlock])) {
            $this->selectedCustomInfoBlock = $this->customInfoBlocks[$this->mainInfBlock];
        }
    }

    private function checkUser(): bool
    {
        $this->user = Administrator::find()->where([
            'LOGIN' => $this->login,
            'PASSWORD_MD5' => $this->passwordHash
        ])->one();

        return $this->user->ADMINISTRATOR_ID;
    }

    private function newsThemeExists(int $id): bool
    {
        $customThemeTable = $this->getCustomNewsParameter('table_theme');

        if ($customThemeTable !== '') {
            $newsTheme =
                new class extends ActiveRecord
                {
                    public static $genericTableName;
    
                    public static function tableName()
                    {
                        return "{{".self::$genericTableName."}}";
                    }
                };

            $newsTheme::$genericTableName = $customThemeTable;

            return !empty($newsTheme::findOne($id));
        }

        return !empty(NewsTheme::findOne($id));
    }

    private function mainInfBlockExists(): bool
    {
        if ($this->isCustomNews()) {
            return
                InfBlock::find()->where([
                    'PRG_MODULE_ID' => (int)$this->getCustomNewsParameter('PRG_MODULE_ID'),
                    'INF_BLOCK_ID' => (int)$this->getCustomNewsParameter('NEW_INF_BLOCK_ID')
                ])->exists();
        }

        return
            InfBlock::find()->where([
                'PRG_MODULE_ID' => self::PRG_MODULE_NEWS,
                'INF_BLOCK_ID' => $this->mainInfBlock
            ])->exists();
    }

    private function isCustomNews(): bool
    {
        return !empty($this->selectedCustomInfoBlock);
    }

    private function isInfBlockAccessible(int $adminId, int $infBlockId): bool
    {
        if ($infBlockId === 0) {
            return false;
        }

        return BlockUserRole::find()->where([
            'ADMINISTRATOR_ID' => $adminId,
            'INF_BLOCK_ID' => $infBlockId
        ])->exists();
    }

    private function addCustomNews()
    {
        $newInfBlockId = (int)$this->getCustomNewsParameter('NEW_INF_BLOCK_ID');
        $customTable = $this->getCustomNewsParameter('table');

        if (!$this->isInfBlockAccessible($this->user->ADMINISTRATOR_ID, $newInfBlockId)) {
            return;
        }

		$contentId = 0;

        if ($this->titleRu != '') {
            if ($this->isCustomNewsExists(self::LANG_ID_RU)) {
                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_DUPLICATE_NEWS . ": Дублирующая новость");

                throw new StatusException(self::RESPONSE_TEXT_DUPLICATE_NEWS);
            }

            $news =
                new class extends ActiveRecord
                {
                    public static $genericTableName;
    
                    public static function tableName()
                    {
                        return "{{".self::$genericTableName."}}";
                    }
                };

            $news::$genericTableName = $customTable;

            $news->NEWS_DATE = $this->changeDateFormat($this->newsDate); 
            $news->PUB_DATE = $this->changeDateFormat($this->pubDate);
            $news->TITLE = $this->titleRu;
            $news->ANNOUNCE = $this->announceRu;
            $news->BODY = $this->bodyRu;
            $news->FOR_QI_ONLY = $this->forQiOnly;
            $news->LANG_ID = self::LANG_ID_RU;
            $news->IMPORTANCE = $this->importance;
            $news->NEWS_THEME_ID = $this->newsThemeId;
            $news->TIME_STAMP = time();
            $news->save();

            $contentId = $news->CONTENT_ID;

            // Регистрация в журнале изменений
            $this->logJournalContent($contentId, self::LANG_ID_RU);

            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена рабочая версия на русском языке [id:$contentId]");

            $this->isNewsCreated = true;
        }

        if ($this->titleEn != '') {
            if ($this->isCustomNewsExists(self::LANG_ID_EN)) {
                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_DUPLICATE_NEWS . ": Дублирующая новость (langId: 'EN')");

                throw new StatusException(self::RESPONSE_TEXT_DUPLICATE_NEWS);
            }

            $news =
                new class extends ActiveRecord
                {
                    public static $genericTableName;
    
                    public static function tableName()
                    {
                        return "{{".self::$genericTableName."}}";
                    }
                };

            $news::$genericTableName = $customTable;

            $news->NEWS_DATE = $this->changeDateFormat($this->newsDate);
            $news->PUB_DATE = $this->changeDateFormat($this->pubDate);
            $news->TITLE = $this->titleEn;
            $news->ANNOUNCE = $this->announceEn;
            $news->BODY = $this->bodyEn;
            $news->FOR_QI_ONLY = $this->forQiOnly;
            $news->LANG_ID = self::LANG_ID_EN;
            $news->IMPORTANCE = $this->importance;
            $news->NEWS_THEME_ID = $this->newsThemeId;
            $news->TIME_STAMP = time();

            if ($contentId) {
                $news->CONTENT_ID = $contentId;
            }

            $news->save();

            // берем последний id
            if ($contentId === 0) {
                $contentId = $news->CONTENT_ID;
            }

            // Регистрация в журнале изменений
            $this->logJournalContent($contentId, self::LANG_ID_EN);

            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена рабочая версия на английском языке [id:$contentId]");

            $this->isNewsCreated = true;
        }

        if ($contentId !== 0) {
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Новость ID=$contentId добавлена в блок №$newInfBlockId");
        }
    }

    private function addNews()
    {
        // проверка существования сатусов
        $stateRuData = State::findOne($this->stateRu);
        $stateEnData = State::findOne($this->stateEn);

        $infBlockListForAdd = [];

        // к каким еще блокам привязать новость?
        $infBlocks =
            InfBlock::find()
                ->where([
                    'PRG_MODULE_ID' => self::PRG_MODULE_NEWS,
                    'INF_BLOCK_ID' => $this->infBlockList
                ])
                ->andWhere([
                    'not', ['INF_BLOCK_ID' => $this->mainInfBlock]
                ])
                ->all();

        foreach ($infBlocks as $block) {
            $infBlockListForAdd[] = ['INF_BLOCK_ID' => $block->INF_BLOCK_ID];
        }

        // общий id новости неизвестен
        $contentId = 0;

        if ($this->titleRu != '' && !empty($stateRuData)) {
            $needToAddResolution = false;

            if ($stateRuData->EXIST_TEST == 1) {
                // Добавление в NEWS тестовой версии (RUS)
                if ($this->isNewsExists(self::NEWS_VERSION_TEST, self::LANG_ID_RU)) {
                    Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_DUPLICATE_NEWS . ": Дублирующая новость (langId: 'RU', version: 'Test')");

                    throw new StatusException(self::RESPONSE_TEXT_DUPLICATE_NEWS);
                }

                $needToAddResolution = true;

                $news = new News;
                $news->VERSION = self::NEWS_VERSION_TEST;
                $news->NEWS_DATE = $this->changeDateFormat($this->newsDate); 
                $news->PUB_DATE = $this->changeDateFormat($this->pubDate); 
                $news->TITLE = $this->titleRu;
                $news->ANNOUNCE = $this->announceRu;
                $news->BODY = $this->bodyRu;
                $news->FOR_QI_ONLY = $this->forQiOnly;
                $news->LANG_ID = self::LANG_ID_RU;
                $news->STATE_ID = $this->stateRu;
                $news->IMPORTANCE = $this->importance;
                $news->NEWS_THEME_ID = $this->newsThemeId;
                $news->TIME_STAMP = $this->timeStamp;

                if ($contentId != 0) {
                    $news->CONTENT_ID = $contentId;
                }

                $news->save();

                if ($contentId === 0) {
                    $contentId = $news->CONTENT_ID;
                }

                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена тестовая версия на русском языке [id:$contentId]");

                $this->isNewsCreated = true;
            }

            if ($stateRuData->EXIST_RELEASE == 1) {
                if ($this->isNewsExists(self::NEWS_VERSION_PROD, self::LANG_ID_RU)) {
                    Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_DUPLICATE_NEWS . ": Дублирующая новость (langId: 'RU', version: 'Prod')");

                    throw new StatusException(self::RESPONSE_TEXT_DUPLICATE_NEWS);
                }

                // Добавление в NEWS рабочей версии (RUS)
                $needToAddResolution = true;

                $news = new News;
                $news->VERSION = self::NEWS_VERSION_PROD;
                $news->NEWS_DATE = $this->changeDateFormat($this->newsDate); 
                $news->PUB_DATE = $this->changeDateFormat($this->pubDate); 
                $news->TITLE = $this->titleRu;
                $news->ANNOUNCE = $this->announceRu;
                $news->BODY = $this->bodyRu;
                $news->FOR_QI_ONLY = $this->forQiOnly;
                $news->LANG_ID = self::LANG_ID_RU;
                $news->STATE_ID = $this->stateRu;
                $news->IMPORTANCE = $this->importance;
                $news->NEWS_THEME_ID = $this->newsThemeId;
                $news->TIME_STAMP = $this->timeStamp;

                if ($contentId !== 0) {
                    $news->CONTENT_ID = $contentId;
                }

                $news->save();

                if ($contentId === 0) {
                    $contentId = $news->CONTENT_ID;
                }

                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена рабочая версия на русском языке [id:$contentId]");

                $this->isNewsCreated = true;
            }
            
            if ($needToAddResolution) {
                $resolution = new Resolution;
                $resolution->ADMINISTRATOR_ID = $this->user->ADMINISTRATOR_ID;
                $resolution->CONTENT_ID = $contentId;
                $resolution->LANG_ID = self::LANG_ID_RU;
                $resolution->MODULE_ID = self::PRG_MODULE_NEWS;
                $resolution->RESOLUTION_TIME = $this->timeStamp;
                $resolution->COMMENTS = 'Добавлено роботом';
                $resolution->STATUS_GRAPH_ID = self::STATUS_GRAPH_ID_RU;
                $resolution->save();

                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена резолюция №" . self::STATUS_GRAPH_ID_RU . " для русской версии");
            }
        } else {
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . 'Русская версия не задана');
        }

        if ($this->titleEn != '' && !empty($stateEnData)) {
            $needToAddResolution = false;

            if ($stateEnData->EXIST_TEST == 1) {
                if ($this->isNewsExists(self::NEWS_VERSION_TEST, self::LANG_ID_EN)) {
                    Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_DUPLICATE_NEWS . ": Дублирующая новость (langId: 'EN', version: 'Test')");

                    throw new StatusException(self::RESPONSE_TEXT_DUPLICATE_NEWS);
                }

                // Добавление в NEWS тестовой версии (EN)
                $needToAddResolution = true;

                $news = new News;
                $news->VERSION = self::NEWS_VERSION_TEST;
                $news->NEWS_DATE = $this->changeDateFormat($this->newsDate); 
                $news->PUB_DATE = $this->changeDateFormat($this->pubDate); 
                $news->TITLE = $this->titleEn;
                $news->ANNOUNCE = $this->announceEn;
                $news->BODY = $this->bodyEn;
                $news->FOR_QI_ONLY = $this->forQiOnly;
                $news->LANG_ID = self::LANG_ID_EN;
                $news->STATE_ID = $this->stateEn;
                $news->IMPORTANCE = $this->importance;
                $news->NEWS_THEME_ID = $this->newsThemeId;
                $news->TIME_STAMP = $this->timeStamp;

                if ($contentId !== 0) {
                    $news->CONTENT_ID = $contentId;
                }

                $news->save();

                if ($contentId === 0) {
                    $contentId = $news->CONTENT_ID;
                }

                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена тестовая версия на английском языке [id:$contentId]");

                $this->isNewsCreated = true;
            }

            if ($stateEnData->EXIST_RELEASE == 1) {
                if ($this->isNewsExists(self::NEWS_VERSION_PROD, self::LANG_ID_EN)) {
                    Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_DUPLICATE_NEWS . ": Дублирующая новость (langId: 'EN', version: 'Prod')");

                    throw new StatusException(self::RESPONSE_TEXT_DUPLICATE_NEWS);
                }

                // Добавление в NEWS рабочей версии (EN)
                $needToAddResolution = true;

                $news = new News;
                $news->VERSION = self::NEWS_VERSION_PROD;
                $news->NEWS_DATE = $this->changeDateFormat($this->newsDate); 
                $news->PUB_DATE = $this->changeDateFormat($this->pubDate); 
                $news->TITLE = $this->titleEn;
                $news->ANNOUNCE = $this->announceEn;
                $news->BODY = $this->bodyEn;
                $news->FOR_QI_ONLY = $this->forQiOnly;
                $news->LANG_ID = self::LANG_ID_EN;
                $news->STATE_ID = $this->stateEn;
                $news->IMPORTANCE = $this->importance;
                $news->NEWS_THEME_ID = $this->newsThemeId;
                $news->TIME_STAMP = $this->timeStamp;

                if ($contentId !== 0) {
                    $news->CONTENT_ID = $contentId;
                }

                $news->save();

                if ($contentId === 0) {
                    $contentId = $news->CONTENT_ID;
                }

                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена рабочая версия на английском языке [id:$contentId]");

                $this->isNewsCreated = true;
            }

            if ($needToAddResolution) {
                $resolution = new Resolution;
                $resolution->ADMINISTRATOR_ID = $this->user->ADMINISTRATOR_ID;
                $resolution->CONTENT_ID = $contentId;
                $resolution->LANG_ID = self::LANG_ID_EN;
                $resolution->MODULE_ID = self::PRG_MODULE_NEWS;
                $resolution->RESOLUTION_TIME = $this->timeStamp;
                $resolution->COMMENTS = 'Добавлено роботом';
                $resolution->STATUS_GRAPH_ID = self::STATUS_GRAPH_ID_EN;
                $resolution->save();

                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Добавлена резолюция №" . self::STATUS_GRAPH_ID_EN . " для английской версии");
            }
        } else {
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . 'Английская версия не задана');
        }

        if ($contentId !== 0) {
            // Новость была добавлена ($contentId != 0)
            // Добавление в CONTENT_MAP главного блока
            $contentMap = new ContentMap;
            $contentMap->INF_BLOCK_ID = $this->mainInfBlock;
            $contentMap->CONTENT_ID = $contentId;
            $contentMap->IS_MAIN = 1;
            $contentMap->save();

            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Новость ID=$contentId добавлена в основной блок №{$this->mainInfBlock}");

            // Добавление в CONTENT_MAP привязок (если они есть)
            for ($i = 0; $i < count($infBlockListForAdd); $i++) {
                $blockId = $infBlockListForAdd[$i]['INF_BLOCK_ID'];

                $contentMap = new ContentMap;
                $contentMap->INF_BLOCK_ID = $blockId;
                $contentMap->CONTENT_ID = $contentId;
                $contentMap->IS_MAIN = 0;
                $contentMap->save();

                Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . "Новость ID=$contentId привязана к доп. блоку: №$blockId");
            }
        }
    }

    private function logRequestData()
    {
        $data =
            "REMOTE_ADDR: '{$_SERVER["REMOTE_ADDR"]}'\r\n" .
            "action: '$this->action'\r\n" .
            "newsThemeId: '$this->newsThemeId'\r\n" .
            "login: '$this->login'\r\n" .
            "newsDate: '$this->newsDate'\r\n" .
            "pubDate: '$this->pubDate'\r\n" .
            "importance: '$this->importance'\r\n" .
            "titleRu: '$this->titleRu'\r\n" .
            "titleEn: '$this->titleEn'\r\n" .
            "announceRu: '$this->announceRu'\r\n" .
            "announceEn: '$this->announceEn'\r\n" .
            "bodyRu: '$this->bodyRu'\r\n" .
            "bodyEn: '$this->bodyEn'\r\n" .
            "forQiOnly: '$this->forQiOnly'\r\n" .
            "stateRu: '$this->stateRu'\r\n" .
            "stateEn: '$this->stateEn'\r\n" .
            "mainInfBlock: '$this->mainInfBlock'\r\n" .
            "infBlockList: '" . join(', ', $this->infBlockList);

        Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . $data);
    }

    private function generateFilePath(string $fileName): string
    {
        return Yii::$app->basePath . self::FILES_PATH . $fileName;
    }

    private function logJournalContent(int $contentId, int $langId): void
    {
        $activeRecord =
            new class extends ActiveRecord
            {
                public static $genericTableName;

                public static function tableName()
                {
                    return "{{".self::$genericTableName."}}";
                }
            };

        $activeRecord::$genericTableName = $this->getCustomNewsParameter('table');

        $prgModule = $activeRecord::find()->where(['CONTENT_ID' => $contentId, 'LANG_ID' => $langId])->one();

        $block = InfBlock::find()->where([
            'PRG_MODULE_ID' => $this->getCustomNewsParameter('PRG_MODULE_ID'),
            'INF_BLOCK_ID' => $this->getCustomNewsParameter('NEW_INF_BLOCK_ID')
        ])->one();

        $jc = new JournalContent;
        $jc->ADMINISTRATOR_ID = $this->user->ADMINISTRATOR_ID;
        $jc->ADMINISTRATOR_NAME = "{$this->user->LOGIN} ({$this->user->FIO})";
        $jc->OPERATION_DATE = date('YmdHis');
        $jc->PRG_MODULE_ID = $block->PRG_MODULE_ID;
        $jc->LANG_ID = $langId;
        $jc->CONTENT_ID = $contentId;
        $jc->CONTENT_INFO = "Название: \"{$prgModule->TITLE}\" <br>Блок # {$block->INF_BLOCK_ID}: \"{$block->NAME}\"";
        $jc->OPERATION_TYPE = self::JOURNAL_CONTENT_OPERATION_TYPE_ADD;
        $jc->save();
    }

    private function getCustomNewsParameter(string $parameter): string
    {
        $availableParameters = ['table', 'table_theme', 'NEW_INF_BLOCK_ID', 'PRG_MODULE_ID'];

        if (!$this->isCustomNews() || !in_array($parameter, $availableParameters)) {
            return '';
        }

        return $this->selectedCustomInfoBlock[$parameter];
    }

    /**
     * Изменияет формат даты и времени: "ДД.ММ.ГГГГ чч:мм" => "ГГГГММДДччмм00"
     *
     * @param string $date
     *
     * @return string
     *
     * @throws Exception
     */
    private function changeDateFormat(string $date): string
    {
        if (!preg_match(self::PATTERN_DATETIME_FORMAT, $date, $matches)) {
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . "\n" . self::RESPONSE_TEXT_ERROR . ": Неверный формат даты '$date'");

            throw new StatusException(self::RESPONSE_TEXT_ERROR);
        }

        return "{$matches[3]}{$matches[2]}{$matches[1]}{$matches[4]}{$matches[5]}00";
    }

    private function isNewsExists(int $version, int $langId): bool
    {
        if ($this->contentId === 0) {
            return false;
        }

        $news = News::find()->where(['VERSION' => $version, 'LANG_ID' => $langId])->one();

        return !empty($news);
    }

    private function isCustomNewsExists(int $langId): bool
    {
        if ($this->contentId === 0) {
            return false;
        }

        $activeRecord =
            new class extends ActiveRecord
            {
                public static $genericTableName;

                public static function tableName()
                {
                    return "{{".self::$genericTableName."}}";
                }
            };

        $activeRecord::$genericTableName = $this->getCustomNewsParameter('table');

        return $activeRecord::find()->where(['LANG_ID' => $langId])->exists();
    }
}
