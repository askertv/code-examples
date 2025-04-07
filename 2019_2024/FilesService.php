<?php

namespace app\common;

use app\common\webservice\ClientCreator;
use app\models\FileRefs;
use yii\web\Request;
use yii\db\Query;
use Yii;

/**
 * Веб-сервис получения файлов на сайте из страниц:
 *     XML-архив Ver 1.0
 *     XML-архив Ver 2.1
 *     XML-архив Level 2 (формат 1.1)
 */
class FilesService
{
    // Ver 1.0
    const LATEST_FULL_FIXED = 'F_2018_07_22_FULL-0.xml';
    const LATEST_FULL = 'LATEST_FULL.xml';

    // Ver 2.1
    const LATEST_FULL_2 = 'LATEST_20_FULL.xml';

    // Level 2 (1.1)
    const LATEST_PUBLIC = 'LATEST_PUBLIC.xml';
    const LATEST_REPEX = 'LATEST_REPEX.xml';

    const KILOBYTE_IN_BITS = 8192;

    private $soapClient;

    private $availableExtensions = [
        FileRefs::EXTENSION_XML
    ];

    public function __construct()
    {
        $this->soapClient = (new ClientCreator())->getClient();
    }

    public function checkFileInDB(string $name): string
    {
        $info = pathinfo($name);
        $basename = $info['basename'] ?? '';
        $filename = $info['filename'] ?? '';
        $extension = $info['extension'] ?? '';        

        $this->validateExtension($extension);

        $checkedFileName = $basename;
        $LATEST_FULL_flag = false;
        $whereCondition = [];
        $filePrefix = '';

        if (
            self::LATEST_PUBLIC === $basename
            ||
            strpos($basename, '_RR_PUBLIC') !== false
        ) {
            $whereCondition = "file_name_full LIKE '%_RR_PUBLIC%'";
            $filePrefix = '_RR_PUBLIC';
        } elseif (
            self::LATEST_REPEX === $basename
            ||
            strpos($basename, '_REPEX') !== false
        ) {
            $whereCondition = "file_name_full LIKE '%_REPEX%'";
            $filePrefix = '_REPEX';
        } elseif (
            self::LATEST_FULL_2 === $basename
            ||
            strpos($basename, '_FULL_CDF2_0') !== false
        ) {
            $whereCondition = ['file_format_version' => '2.0'];
            $filePrefix = '_FULL_CDF2_0';
        } elseif (
            self::LATEST_FULL === $basename
            ||
            strpos($basename, '_FULL') !== false
        ) {
            $whereCondition = ['OR', "file_format_version='1.0'", 'file_format_version IS NULL'];
            $filePrefix = '_FULL';
        } elseif (
            self::LATEST_FULL === $basename
            ||
            strpos($basename, '_DELTA') !== false
        ) {
            $whereCondition = ['OR', "file_format_version='1.0'", 'file_format_version IS NULL'];
            $filePrefix = '_DELTA';
        }

        if (self::LATEST_FULL === $basename) {
            $LATEST_FULL_flag = true;
            $checkedFileName = self::LATEST_FULL_FIXED;
        } elseif (
            self::LATEST_FULL_2 === $basename
            ||
            self::LATEST_PUBLIC === $basename
            ||
            self::LATEST_REPEX === $basename
        ) {
            // вычисляем последний файл
            if (
                self::LATEST_FULL === $basename
                ||
                self::LATEST_FULL_2 === $basename
            ) {
                $data = $this->getDbLastFileCDF($whereCondition);

                if ($data === null) {
                    Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . " File not found: '$basename'");
                    header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
                    header('Status: 404 Not Found');
                    exit;
                }

                $date = str_replace('-', '_', substr($data->file_date, 0, 10));
                $version = $this->getVersion($data->file_name_full, $data->iteration_number);
            } elseif (
                self::LATEST_PUBLIC === $basename
                ||
                self::LATEST_REPEX === $basename
            ) {
                $data = $this->getDbLastFileLevel2_1();

                if ($data === null) {
                    Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . " File not found: '$basename'");
                    header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
                    header('Status: 404 Not Found');
                    exit;
                }

                $date = str_replace('-', '_', substr($data['file_date'], 0, 10));
                $version = $this->getVersion($data['file_name_full'], $data['iteration_number']);
            }

            $LATEST_FULL_flag = true;
            $checkedFileName = "F_{$date}{$filePrefix}{$version}.$extension";
        }
        
        // Создаем объект для загрузки файлов из веб-сервиса и последующей передачи в поток
        $prefix = '';
        if (strpos($checkedFileName, 'FULL') !== false) {
            $prefix = 'full';
        } elseif (strpos($checkedFileName, 'DELTA') !== false) {
            $prefix = 'delta';
        } elseif (
            strpos($checkedFileName, '_RR_PUBLIC') !== false
            ||
            strpos($checkedFileName, '_REPEX') !== false
        ) {
            $prefix = 'full';
        } else {
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . " File not found: '$checkedFileName'");
            header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
            header('Status: 404 Not Found');
            exit;
        }

        $data =
            FileRefs::find()
                ->where([
                    'OR',
                    "file_name_full LIKE '%" . addslashes($checkedFileName) . "'",
                    "file_name_delta LIKE '%" . addslashes($checkedFileName) . "'"
                ])
                ->limit(1)
                ->one();

        if ($data === null) {
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . " File not found: '$basename'");
            header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
            header('Status: 404 Not Found');
            exit;
        }

        $date = str_replace('-', '_', substr($data->file_date, 0, 10));

        $version = '';
        if (strpos($data->{"file_name_{$prefix}"}, '-') !== false) {
            $version = '-' . $data->iteration_number;
        }

        if (!$LATEST_FULL_flag) {
            $checkedFileName = "F_{$date}{$filePrefix}{$version}.$extension";
        }

        return $checkedFileName;
    }

    public function downloadFile(string $fileName)
    {
        $request = new Request;

        $mimetype =
            $request->getUserAgent() && strpos($request->getUserAgent(), 'MSIE')
                ? 'application/force-download'
                : 'application/octet-stream';

        Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . ' Start download from web service ' . $fileName);

        $chunkSize = 1024 * 1024 * 16;
        $fileSize = $this->getRemoteFileSize('F\\'.$fileName);

        if ($fileSize > 0) {
            header("Content-Type: $mimetype");
            header("Content-Disposition: attachment; filename=\"$fileName\";");
            header("Content-Length: $fileSize");
            header('Pragma: public');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Cache-Control: public');
            header('Content-Description: File Transfer');
            header('Accept-Ranges: bytes');
            header('Content-Transfer-Encoding: binary');

            $methodDownloadPart = 'GetFilePartLong';
            $bytesSent = 0;
            $counter = 0;
            while ($bytesSent < $fileSize) {
                if ($bytesSent + $chunkSize > $fileSize) {
                    $response = $this->soapClient->{$methodDownloadPart}(['filePath' => 'F\\'.$fileName, 'offset' => $bytesSent, 'count' => $fileSize - $bytesSent]);
                    $filePart = $response->{$methodDownloadPart . "Result"};

                    echo base64_decode($filePart);

                    $bytesSent += $fileSize - $bytesSent;

                    break 1;
                }
                $response = $this->soapClient->{$methodDownloadPart}(['filePath' => 'F\\'.$fileName, 'offset' => $bytesSent, 'count' => $chunkSize]);
                $filePart = $response->{$methodDownloadPart . "Result"};

                echo base64_decode($filePart);

                $bytesSent += $chunkSize;
                $counter++;

                if ($counter > 1000 || $bytesSent > 10000000000) {
                    Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . ' Cycle error');
                    header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
                    header('Status: 404 Not Found');
                    exit;
                }
            }
            exit;
        } else {
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . ' Wrong file size: ' . $fileSize);
            header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
            header('Status: 404 Not Found');
            exit;
        }
        Yii::info((substr(__method__, strrpos(__method__, '\\') + 1)) . ' Finish download from web service ' . $fileName);
    }

    private function validateExtension(string $extension)
    {
        if (!$this->isAvailableExtension($extension)) {
            header($_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
            header('Status: 404 Not Found');
            exit;
        }
    }

    private function isAvailableExtension(string $extension): bool
    {
        return in_array($extension, $this->availableExtensions);
    }

    private function getRemoteFileSize(string $fileName): int
    {
        $methodSize = 'GetFileSizeLong';
        try {
            $response = $this->soapClient->{$methodSize}(['filePath' => $fileName]);
            $fileSize = (int) $response->{$methodSize . "Result"};
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . ": $fileName, Size: $fileSize");
            return $fileSize;
        } catch (\SoapFault $e) {
            Yii::error((substr(__method__, strrpos(__method__, '\\') + 1)) . " Error with file : $fileName" . ' ' . $e->getMessage() . "\n" . $e->getTraceAsString());
        }
        return 0;
    }

    private function getDbLastFileCDF(array $whereCondition)
    {
        return
            FileRefs::find()
                ->where($whereCondition)
                ->orderBy(['file_date' => SORT_DESC, 'iteration_number' => SORT_DESC])
                ->limit(1)
                ->one();
    }

    private function getDbLastFileLevel2_1()
    {
        return
            (new Query())
                ->select(
                    'f1.file_name_full,
                    f1.file_date,
                    f1.file_size_full,
                    f2.file_size_full file_size_delta,
                    f2.iteration_number')
                ->from('file_refs f1')
                ->join('inner join', 'file_refs f2', 'f2.file_date = f1.file_date AND f2.iteration_number = f1.iteration_number')
                ->where("f1.file_name_full LIKE '%_RR_PUBLIC%'")
                ->andWhere("f1.file_format_version = '1.0'")
                ->andWhere("f2.file_name_full LIKE '%_REPEX%'")
                ->andWhere("f2.file_format_version = '1.0'")
                ->orderBy(['f1.file_date' => SORT_DESC, 'f2.iteration_number' => SORT_DESC])
                ->limit(1)
                ->one();
    }

    private function getVersion(string $fileNameFull, string $iterationNumber): string
    {
        $version = '';

        if (strpos($fileNameFull, '-') !== false) {
            $version = '-' . $iterationNumber;
        }

        return $version;
    }
}
