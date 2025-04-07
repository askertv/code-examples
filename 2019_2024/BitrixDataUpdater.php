<?php
namespace app\common\btxproject;

use Exception;
use Yii;

use app\models\CommonData;
use app\models\PublicNames;

/**
 * Перенос данных из таблиц Бэкэнда в Битрикс сайт
 */
class BitrixDataUpdater
{
    const LOCK_KEY = 'UPDATE_BTX_DATA';

    private $commonDataFields = [
        'company_id',
        'code',
        'assignment_date',
        'update_date',
        'verification_date',
        'next_recertification_date',
        'expiration_date',
        'is_inactive_cmp',
        'business_reg_id',
        'successor_l_code',
        'legal_jurisdiction',
        'full_name',
        'short_name',
        'legal_name',
        'full_name_en',
        'place_addr',
        'place_addr_en'
    ];

    private $orgNameFields = [
        'company_id',
        'type_name_id',
        'rus_type_name',
        'eng_type_name',
        'lang',
        'name'
    ];

    private $orgAddressFields = [
        'company_id',
        'lang',
        'version',
        'type_name',
        'code_country',
        'code_region',
        'city',
        'post_index',
        'line',
        'type_name_id'
    ];

    private $level2CompaniesFields = [
        'child_id',
        'parent_id',
        'code_child',
        'code_parent',
        'parent',
        'pni',
        'exception_reason',
        'exception_reason_comment',
        'exception_reason_description'
    ];

    private $fileRefsFields = [
        'file_ref_id',
        'file_date',
        'file_name_full',
        'file_size_full',
        'file_name_delta',
        'file_size_delta',
        'file_format_version',
        'iteration_number'
    ];

    private $fileRefsLevel2Fields = [
        'file_name_full',
        'file_date',
        'file_size_full',
        'file_size_delta',
        'iteration_number'
    ];

    private $countriesFields = [
        'country_code',
        'country_name',
        'country_name_en'
    ];

    // Ограничитель на максимальное количество добавляемых записей (для тестирования)
    private $maxAddedRows = 50;

    // Ограничивать ли количество добавляемых записей (для тестирования)
    private $limitAddedRows = false;

    /**
     * Конвертация данных в инфоблоки битрикса
     *
     * btx tables:
     *     b_iblock
     *     b_iblock_property
     *     b_iblock_element
     *     b_iblock_element_property
     */
    public function updateBtxData()
    {
        $memoryLimit = ini_get('memory_limit');
        ini_set('memory_limit', '1G');

        $commonDataCnt = 0;

        try {
            if ($this->isProcessRunning(self::LOCK_KEY)) {
                echo "\nUPDATE PROCESS IS ACTIVE: EXIT [".date('Y-m-d H:i:s')."]\n";
                return;
            }

            $this->startProcess(self::LOCK_KEY);

            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) .
                " ================================ Start ================================");
            echo "\nBTX UPDATES: START [".date('Y-m-d H:i:s')."]\n";

            // Основные данные по блоку кодов
            $commonBlockInfo = $this->getBlockInfo(Yii::$app->params['iblock.code']);
            if (!$commonBlockInfo) {
                throw new Exception('No block found');
            }
            $codeBlockId = (int) $commonBlockInfo[0]['ID'];
            $blockProps = $this->getBlockProps($codeBlockId);
            if (!$blockProps) {
                // Создание свойств у инфоблока
                $this->createBlockProps($codeBlockId, array_merge($this->commonDataFields, ['CLIENT_NAME' => 'CLIENT_NAME']));
                $blockProps = $this->getBlockProps($codeBlockId);
                if (!$blockProps) {
                    throw new Exception('No found block properties');
                }
            }

            // Данные по названиям организаций
            $orgNamesInfo = $this->getBlockInfo(Yii::$app->params['iblock.code.names']);
            if (!$orgNamesInfo) {
                throw new Exception('No found block org names');
            }
            $orgNamesBlockId = (int) $orgNamesInfo[0]['ID'];
            $orgNamesBlockProps = $this->getBlockProps($orgNamesBlockId);
            if (!$orgNamesBlockProps) {
                // Создание свойств у инфоблока
                $this->createBlockProps($orgNamesBlockId, $this->orgNameFields);
                $orgNamesBlockProps = $this->getBlockProps($orgNamesBlockId);
                if (!$orgNamesBlockProps) {
                    throw new Exception('No found block properties for org names');
                }
            }

            // Данные по адресам организаций
            $orgAddressesInfo = $this->getBlockInfo(Yii::$app->params['iblock.code.addresses']);
            if (!$orgAddressesInfo) {
                throw new Exception('No found block org addresses');
            }
            $orgAddressesBlockId = (int) $orgAddressesInfo[0]['ID'];
            $orgAddressesBlockProps = $this->getBlockProps($orgAddressesBlockId);
            if (!$orgAddressesBlockProps) {
                // Создание свойств у инфоблока
                $this->createBlockProps($orgAddressesBlockId, $this->orgAddressFields);
                $orgAddressesBlockProps = $this->getBlockProps($orgAddressesBlockId);
                if (!$orgAddressesBlockProps) {
                    throw new Exception('No found block properties for org addresses');
                }
            }

            // Данные по материнским компаниям
            $level2CompaniesInfo = $this->getBlockInfo(Yii::$app->params['iblock.code.level2.companies']);
            if (!$level2CompaniesInfo) {
                    throw new Exception('No found block level2 companies');
            }
            $level2CompaniesBlockId = (int) $level2CompaniesInfo[0]['ID'];
            $level2CompaniesBlockProps = $this->getBlockProps($level2CompaniesBlockId);
            if (!$level2CompaniesBlockProps) {
                // Создание свойств у инфоблока
                $this->createBlockProps($level2CompaniesBlockId, $this->level2CompaniesFields);
                $level2CompaniesBlockProps = $this->getBlockProps($level2CompaniesBlockId);
                if (!$level2CompaniesBlockProps) {
                    throw new Exception('No found block properties for level2 companies');
                }
            }

            // Данные для страниц: XML-архив Ver 1.0/XML-архив Ver 2.1
            $fileRefsInfo = $this->getBlockInfo(Yii::$app->params['iblock.code.file.refs']);
            if (!$fileRefsInfo) {
                throw new Exception('No found block file refs');
            }
            $fileRefsBlockId = (int) $fileRefsInfo[0]['ID'];
            $fileRefsBlockProps = $this->getBlockProps($fileRefsBlockId);
            if (!$fileRefsBlockProps) {
                // Создание свойств у инфоблока
                $this->createBlockProps($fileRefsBlockId, $this->fileRefsFields);
                $fileRefsBlockProps = $this->getBlockProps($fileRefsBlockId);
                if (!$fileRefsBlockProps) {
                    throw new Exception('No found block properties for file refs');
                }
            }

            // Данные для страницы XML-архив Level 2 (формат 1.1)
            $fileRefsLevel2Info = $this->getBlockInfo(Yii::$app->params['iblock.code.file.refs.level2']);
            if (!$fileRefsLevel2Info) {
                throw new Exception('No found block file refs level2');
            }
            $fileRefsLevel2BlockId = (int) $fileRefsLevel2Info[0]['ID'];
            $fileRefsLevel2BlockProps = $this->getBlockProps($fileRefsLevel2BlockId);
            if (!$fileRefsLevel2BlockProps) {
                // Создание свойств у инфоблока
                $this->createBlockProps($fileRefsLevel2BlockId, $this->fileRefsLevel2Fields);
                $fileRefsLevel2BlockProps = $this->getBlockProps($fileRefsLevel2BlockId);
                if (!$fileRefsLevel2BlockProps) {
                    throw new Exception('No found block properties for file refs level2');
                }
            }

            echo "\ncloneTables: start [".date('Y-m-d H:i:s')."]\n";
            $this->cloneTables();
            echo "cloneTables: finish [".date('Y-m-d H:i:s')."]\n";

            // Удаление элементов и свойств
            echo "\nУдаление элементов и свойств [".date('Y-m-d H:i:s')."]\n";
            $this->cleanBlockData($codeBlockId);
            $this->cleanBlockData($orgNamesBlockId);
            $this->cleanBlockData($orgAddressesBlockId);
            $this->cleanBlockData($level2CompaniesBlockId);
            $this->cleanBlockData($fileRefsBlockId);
            $this->cleanBlockData($fileRefsLevel2BlockId);

            // Создание элементов и заполнение свойств
            echo "\nСоздание элементов и заполнение свойств [".date('Y-m-d H:i:s')."]\n";
            echo "\naddCommonData: start [".date('Y-m-d H:i:s')."]\n";
            $commonDataCnt = $this->addCommonData($blockProps, $codeBlockId);
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Add $commonDataCnt CODE rows into Bitrix");
            echo "addCommonData: finish [".date('Y-m-d H:i:s')."]\n";

            echo "\naddOrgNames: start [".date('Y-m-d H:i:s')."]\n";
            $orgNamesCnt = $this->addOrgNames($orgNamesBlockProps, $orgNamesBlockId);
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Add $orgNamesCnt org names");
            echo "addOrgNames: finish [".date('Y-m-d H:i:s')."]\n";

            echo "\naddOrgAddresses: start [".date('Y-m-d H:i:s')."]\n";
            $orgAddrCnt = $this->addOrgAddresses($orgAddressesBlockProps, $orgAddressesBlockId);
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Add $orgAddrCnt org addresses");
            echo "addOrgAddresses: finish [".date('Y-m-d H:i:s')."]\n";

            echo "\naddLevel2Companies: start [".date('Y-m-d H:i:s')."]\n";
            $level2CompaniesCnt = $this->addLevel2Companies($level2CompaniesBlockProps, $level2CompaniesBlockId);
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Add $level2CompaniesCnt org parents");
            echo "addLevel2Companies: finish [".date('Y-m-d H:i:s')."]\n";

            echo "\naddFileRefs: start [".date('Y-m-d H:i:s')."]\n";
            $fileRefsCnt = $this->addFileRefs($fileRefsBlockProps, $fileRefsBlockId);
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Add $fileRefsCnt file refs");
            echo "addFileRefs: finish [".date('Y-m-d H:i:s')."]\n";

            echo "\naddFileRefsLevel2: start [".date('Y-m-d H:i:s')."]\n";
            $fileRefsLevel2Cnt = $this->addFileRefsLevel2($fileRefsLevel2BlockProps, $fileRefsLevel2BlockId);
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Add $fileRefsLevel2Cnt file refs level2");
            echo "addFileRefsLevel2: finish [".date('Y-m-d H:i:s')."]\n";

            echo "\nrename tables: start [".date('Y-m-d H:i:s')."]\n";
            $this->renameTables();
            echo "rename tables: finish [".date('Y-m-d H:i:s')."]\n";

            $this->endProcess(self::LOCK_KEY);

        } catch (Exception $e) {
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . ' ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            $this->endProcess(self::LOCK_KEY);
        }

        Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) .
                " ================================ Finish ================================");
        echo "\nBTX UPDATES: FINISH [".date('Y-m-d H:i:s')."]\n";

        ini_set('memory_limit', $memoryLimit);

        return $commonDataCnt;
    }

    /**
     * Конвертация данных по странам в инфоблоки битрикса
     *
     * btx tables:
     *     b_iblock
     *     b_iblock_property
     *     b_iblock_element
     *     b_iblock_element_property
     */
    public function updateBtxDataCountries()
    {
        $memoryLimit = ini_get('memory_limit');
        ini_set('memory_limit', '1G');

        $commonDataCnt = 0;

        try {
            if ($this->isProcessRunning(self::LOCK_KEY)) {
                echo "\nUPDATE PROCESS IS ACTIVE: EXIT [".date('Y-m-d H:i:s')."]\n";
                return;
            }

            $this->startProcess(self::LOCK_KEY);

            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) .
                " ================================ Start ================================");
            echo "\nBTX UPDATES COUNTRIES: START [".date('Y-m-d H:i:s')."]\n";

            // Данные по странам
            $countriesInfo = $this->getBlockInfo(Yii::$app->params['iblock.code.countries']);
            if (!$countriesInfo) {
                    throw new Exception('No found block countries');
            }
            $countriesBlockId = (int) $countriesInfo[0]['ID'];
            $countriesBlockProps = $this->getBlockProps($countriesBlockId);
            if (!$countriesBlockProps) {
                // Создание свойств у инфоблока
                $this->createBlockProps($countriesBlockId, $this->countriesFields);
                $countriesBlockProps = $this->getBlockProps($countriesBlockId);
                if (!$countriesBlockProps) {
                    throw new Exception('No found block properties for countries');
                }
            }

            echo "\ncloneTables: start [".date('Y-m-d H:i:s')."]\n";
            $this->cloneTables();
            echo "cloneTables: finish [".date('Y-m-d H:i:s')."]\n";

            // Удаление элементов и свойств
            echo "\nУдаление элементов и свойств [".date('Y-m-d H:i:s')."]\n";
            $this->cleanBlockData($countriesBlockId);

            echo "\naddCountries: start [".date('Y-m-d H:i:s')."]\n";
            $countriesCnt = $this->addCountries($countriesBlockProps, $countriesBlockId);
            Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . " Add $countriesCnt countries");
            echo "addCountries: finish [".date('Y-m-d H:i:s')."]\n";

            echo "\nrename tables: start [".date('Y-m-d H:i:s')."]\n";
            $this->renameTables();
            echo "rename tables: finish [".date('Y-m-d H:i:s')."]\n";

            $this->endProcess(self::LOCK_KEY);

        } catch (Exception $e) {
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . ' ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            $this->endProcess(self::LOCK_KEY);
        }

        Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) .
                " ================================ Finish ================================");
        echo "\nBTX UPDATES COUNTRIES: FINISH [".date('Y-m-d H:i:s')."]\n";

        ini_set('memory_limit', $memoryLimit);
    }

    private function addElementProps(array $blockProps, array $dataFields, int $elementId, array $row)
    {
        foreach ($blockProps as $bProp) {
            if (!isset($dataFields[ $bProp['CODE'] ])) {
                continue;
            }

            // Insert into props
            $sql = '
                INSERT INTO
                    b_iblock_element_property_tmp
                SET
                    IBLOCK_PROPERTY_ID = ' . $bProp['ID'] . ',
                    IBLOCK_ELEMENT_ID = ' . $elementId . ',
                    VALUE = "' . addslashes(trim($row[ $dataFields[ $bProp['CODE'] ] ])) . '"
                ';

            Yii::$app->btxdb->createCommand($sql)->execute();
        }
    }

    private function cloneTables()
    {
        $this->cloneTable('b_iblock_element');
        $this->cloneTable('b_iblock_element_property');
    }

    private function cloneTable(string $tableName)
    {
        Yii::$app->btxdb->createCommand("DROP TABLE IF EXISTS {$tableName}_tmp")->execute();
        Yii::$app->btxdb->createCommand("CREATE TABLE {$tableName}_tmp LIKE $tableName")->execute();
        Yii::$app->btxdb->createCommand("INSERT INTO {$tableName}_tmp SELECT * FROM $tableName")->execute();
    }

    private function renameTables()
    {
        $this->renameTable('b_iblock_element');
        $this->renameTable('b_iblock_element_property');
    }

    private function renameTable(string $tableName)
    {
        Yii::$app->btxdb->createCommand("DROP TABLE IF EXISTS {$tableName}_del")->execute();
        Yii::$app->btxdb->createCommand("RENAME TABLE $tableName TO {$tableName}_del")->execute();
        Yii::$app->btxdb->createCommand("RENAME TABLE {$tableName}_tmp TO $tableName")->execute();
        // Можно сразу удалить "{$tableName}_del", а можно оставить, для анализа и сравнения. В следущей иттерации, он всё равно удалится
    }

    private function cleanBlockData(int $blockId)
    {
        $sql = '
            DELETE
                e, p
            FROM
                b_iblock_element_tmp e
            LEFT JOIN
                b_iblock_element_property_tmp p
                ON
                p.IBLOCK_ELEMENT_ID = e.ID
            WHERE
                e.IBLOCK_ID = ' . $blockId . '
            ';

        Yii::$app->btxdb->createCommand($sql)->execute();
    }

    private function getBlockInfo(string $code)
    {
        $sql = "SELECT * FROM b_iblock WHERE CODE LIKE '$code'";
        return Yii::$app->btxdb->createCommand($sql)->queryAll();
    }

    private function getBlockProps(int $blockId)
    {
        $sql = "SELECT * FROM b_iblock_property WHERE IBLOCK_ID = $blockId";
        return Yii::$app->btxdb->createCommand($sql)->queryAll();
    }

    private function createBlockElement(int $blockId, string $name, string $searchableContent = '', string $code = '', int $sort = 500): int
    {
        if (!$searchableContent) {
            $searchableContent = mb_strtoupper($name);
        }

        $sql = "
            INSERT INTO
                b_iblock_element_tmp
            SET
                TIMESTAMP_X = NOW(),
                MODIFIED_BY = 1,
                DATE_CREATE = NOW(),
                CREATED_BY = 1,
                IBLOCK_ID = $blockId,
                ACTIVE = 'Y',
                NAME = '$name',
                SEARCHABLE_CONTENT = '$searchableContent',
                CODE = '$code',
                TAGS = '',
                TMP_ID = 0,
                SORT = $sort
            ";

        $insertResult = Yii::$app->btxdb->createCommand($sql)->execute();
        if (!$insertResult) {
            throw new Exception('Error on creating iblock element');
        }

        $elementId = (int) Yii::$app->btxdb->getLastInsertID();

        $sql = "UPDATE b_iblock_element_tmp SET XML_ID = $elementId WHERE ID = $elementId";
        Yii::$app->btxdb->createCommand($sql)->execute();

        return $elementId;
    }

    private function createBlockProps(int $blockId, array $fields)
    {
        foreach ($fields as $field) {
            $btxField = mb_strtoupper($field);
            $sql = "
                INSERT INTO b_iblock_property
                SET
                    TIMESTAMP_X = NOW(),
                    IBLOCK_ID = $blockId,
                    NAME = '$btxField',
                    CODE = '$btxField'
                ";
            Yii::$app->btxdb->createCommand($sql)->execute();
        }
    }

    private function addCommonData(array $blockProps, int $blockId): int
    {
        $dataFields = [];
        $selectTxt = '';
        $sep = '';
        foreach ($this->commonDataFields as $field) {
            $selectTxt .= "{$sep}cd.$field";
            $sep = ",\n";
            $btxField = mb_strtoupper($field);
            $dataFields[$btxField] = $field;
        }
        $dataFields['CLIENT_NAME'] = 'CLIENT_NAME';

        // Get elements
        // Выборка данных, для построения страницы с кодами в Битриксе 
        $sql = '
            SELECT
                pn.name CLIENT_NAME,
                '. $selectTxt .'
            FROM
                common_data cd
            LEFT JOIN
                public_names pn
                ON
                pn.company_id = cd.company_id
            WHERE
                pn.type_name_id = 1
            ORDER BY
                cd.update_date
            ';

        $commonData = Yii::$app->db->createCommand($sql)->queryAll();
        if (!$commonData) {
            throw new Exception('No found common data for btx site');
        }

        $cnt = 0;
        foreach ($commonData as $data) {
            if (!$this->limitAddedRows || $cnt < $this->maxAddedRows) {
                // Insert into elements
                $clientName = $this->prepareText($data['CLIENT_NAME']);
                $elementId = $this->createBlockElement($blockId, $clientName['short'], mb_strtoupper($clientName['original']));
                $this->addElementProps($blockProps, $dataFields, $elementId, $data);
                $cnt++;
            }
        }

        return $cnt;
    }

    private function addOrgNames(array $blockProps, int $blockId): int
    {
        $dataFields = [];
        $selectTxt = '';
        $sep = '';
        foreach ($this->orgNameFields as $field) {
            $selectTxt .= "{$sep}$field";
            $sep = ",\n";
            $btxField = mb_strtoupper($field);
            $dataFields[$btxField] = $field;
        }

        $sql = "
            SELECT
                $selectTxt,
                (CASE type_name_id WHEN 2 THEN 10 ELSE type_name_id END) names_order
            FROM
                public_names
            ORDER BY
                company_id,
                names_order
            ";

        $namesData = Yii::$app->db->createCommand($sql)->queryAll();
        if (!$namesData) {
            throw new Exception('No found org names');
        }

        $cnt = 0;
        $curCompanyId = 0;
        $sort = 10;
        foreach ($namesData as $data) {
            if (!$this->limitAddedRows || $cnt < $this->maxAddedRows) {
                if ($curCompanyId != trim($data['company_id'])) {
                    $curCompanyId = trim($data['company_id']);
                    $sort = 10;
                }
                // Insert into elements
                $name = $this->prepareText($data['name']);
                $elementId = $this->createBlockElement(
                    $blockId,
                    $name['short']. ' - ' . trim($data['company_id']),
                    mb_strtoupper($name['original']),
                    '',
                    $sort
                );

                $this->addElementProps($blockProps, $dataFields, $elementId, $data);
                $cnt++;
                $sort += 10;
            }
        }

        return $cnt;
    }

    private function addOrgAddresses(array $blockProps, int $blockId): int
    {
        $dataFields = [];
        $selectTxt = '';
        $sep = '';
        foreach ($this->orgAddressFields as $field) {
            $selectTxt .= "{$sep}$field";
            $sep = ",\n";
            $btxField = mb_strtoupper($field);
            $dataFields[$btxField] = $field;
        }

        $sql = "SELECT $selectTxt FROM public_addresses";
        $addressesData = Yii::$app->db->createCommand($sql)->queryAll();
        if (!$addressesData) {
            throw new Exception('No found org addresses');
        }

        $cnt = 0;
        foreach ($addressesData as $data) {
            if (!$this->limitAddedRows || $cnt < $this->maxAddedRows) {
                // Insert into elements
                $name = $this->prepareText($data['type_name']);
                $elementId = $this->createBlockElement($blockId, $name['short'] . ' - ' . trim($data['company_id']), mb_strtoupper($name['original']));
                $this->addElementProps($blockProps, $dataFields, $elementId, $data);
                $cnt++;
            }
        }

        return $cnt;
    }

    private function addLevel2Companies(array $blockProps, int $blockId): int
    {
        $dataFields = [];
        $selectTxt = '';
        $sep = '';
        foreach ($this->level2CompaniesFields as $field) {
            $selectTxt .= "{$sep}$field";
            $sep = ",\n";
            $btxField = mb_strtoupper($field);
            $dataFields[$btxField] = $field;
        }

        $sql = "SELECT $selectTxt FROM level2_companies";
        $level2CompaniesData = Yii::$app->db->createCommand($sql)->queryAll();
        if (!$level2CompaniesData) {
            throw new Exception('No found level2 companies');
        }

        $cnt = 0;
        foreach ($level2CompaniesData as $data) {
            if (!$this->limitAddedRows || $cnt < $this->maxAddedRows) {
                // Insert into elements
                $name = $this->prepareText($data['code_child'] . '_' . $data['parent']);
                $elementId = $this->createBlockElement($blockId, $name['short'] . ' - ' . trim($data['child_id']), mb_strtoupper($name['original']));
                $this->addElementProps($blockProps, $dataFields, $elementId, $data);
                $cnt++;
            }
        }

        return $cnt;
    }

    private function addFileRefs(array $blockProps, int $blockId): int
    {
        $dataFields = [];
        $selectTxt = '';
        $sep = '';
        foreach ($this->fileRefsFields as $field) {
            $selectTxt .= "{$sep}$field";
            $sep = ",\n";
            $btxField = mb_strtoupper($field);
            $dataFields[$btxField] = $field;
        }

        $sql = "SELECT $selectTxt FROM file_refs";
        $fileRefsData = Yii::$app->db->createCommand($sql)->queryAll();
        if (!$fileRefsData) {
            throw new Exception('No found file refs');
        }

        $cnt = 0;
        foreach ($fileRefsData as $data) {
            if (!$this->limitAddedRows || $cnt < $this->maxAddedRows) {
                // Insert into elements
                $name = $this->prepareText($data['file_name_full']);
                $elementId = $this->createBlockElement($blockId, $name['short'], mb_strtoupper($name['original']));
                $this->addElementProps($blockProps, $dataFields, $elementId, $data);
                $cnt++;
            }
        }

        return $cnt;
    }

    private function addFileRefsLevel2(array $blockProps, int $blockId): int
    {
        $dataFields = [];
        foreach ($this->fileRefsLevel2Fields as $field) {
            $btxField = mb_strtoupper($field);
            $dataFields[$btxField] = $field;
        }

        $sql = "
            SELECT
                f1.file_name_full,
                f1.file_date,
                f1.file_size_full,
                f2.file_size_full file_size_delta,
                f2.iteration_number
            FROM
                file_refs f1
            JOIN
                file_refs f2
            USING
                (file_date, iteration_number)
            WHERE
                f1.file_name_full LIKE '%_RR_PUBLIC%'
                AND
                f1.file_format_version = '1.0'
                AND
                f2.file_name_full LIKE '%_REPEX%'
                AND
                f2.file_format_version = '1.0'
            ORDER BY
                f1.file_date DESC,
                f2.iteration_number DESC
            ";

        $fileRefsLevel2Data = Yii::$app->db->createCommand($sql)->queryAll();
        if (!$fileRefsLevel2Data) {
            throw new Exception('No found file refs level2');
        }

        $cnt = 0;
        foreach ($fileRefsLevel2Data as $data) {
            if (!$this->limitAddedRows || $cnt < $this->maxAddedRows) {
                // Insert into elements
                $name = $this->prepareText($data['file_name_full']);
                $elementId = $this->createBlockElement($blockId, $name['short'], mb_strtoupper($name['original']));
                $this->addElementProps($blockProps, $dataFields, $elementId, $data);
                $cnt++;
            }
        }

        return $cnt;
    }

    private function addCountries(array $blockProps, int $blockId): int
    {
        $dataFields = [];
        foreach ($this->countriesFields as $field) {
            $btxField = mb_strtoupper($field);
            $dataFields[$btxField] = $field;
        }

        $sql = "
            SELECT DISTINCT
                country_code,
                country_name,
                country_name_en
            FROM
                companies_info
            WHERE
                country_code <> '--'
            ORDER BY
                country_name
            ";

        $countriesData = Yii::$app->db->createCommand($sql)->queryAll();
        if (!$countriesData) {
            throw new Exception('No found countries');
        }

        $cnt = 0;
        $sort = 10;
        foreach ($countriesData as $data) {
            if (!$this->limitAddedRows || $cnt < $this->maxAddedRows) {
                // Insert into elements
                $name = $this->prepareText($data['country_name']);
                $elementId = $this->createBlockElement(
                    $blockId,
                    $name['short'],
                    mb_strtoupper($name['original']),
                    '',
                    $sort
                );
                $this->addElementProps($blockProps, $dataFields, $elementId, $data);
                $cnt++;
                $sort += 10;
            }
        }

        return $cnt;
    }

    private function prepareText(string $text): array
    {
        $original = trim($text);
        $short = mb_substr($original, 0, 100);

        $original = addslashes($original);
        $short = addslashes($short);

        return ['original' => $original, 'short' => $short];
    }

    private function isProcessRunning(string $key): bool
    {
        return !( Yii::$app->btxdb->createCommand("SELECT IS_FREE_LOCK('$key')")->queryScalar() );
    }

    private function startProcess(string $key)
    {
        // Lock на 40 минут
        Yii::$app->btxdb->createCommand("SELECT GET_LOCK('$key', 60*40)")->execute();
    }

    private function endProcess(string $key)
    {
        Yii::$app->btxdb->createCommand("SELECT RELEASE_LOCK('$key')")->execute();
    }
}
