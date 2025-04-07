<?php

use yii\db\Migration;

/**
 * Фикс кодировки UTF-8 для таблицы logs
 *
 * Пример ошибки:
 *  2020/06/02 11:03:06 [error] 1600#1600: *6932 FastCGI sent in stderr:
 *      "PHP message: PHP Warning:  Uncaught SoapFault exception:
 *          [CLIENT] SQLSTATE[HY000]: General error: 1366 Incorrect string value: '\xD0' for column 'file' at row 1
 *
 * @see https://qna.habr.com/q/361544 Как исправить ошибку при записи в mysql «Incorrect string value»?
 * @see https://mathiasbynens.be/notes/mysql-utf8mb4 How to support full Unicode in MySQL databases
 *     # For each database:
 *     ALTER DATABASE database_name CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
 *     # For each table:
 *     ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 *     # For each column:
 *     ALTER TABLE table_name CHANGE column_name column_name VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 *     # (Don’t blindly copy-paste this! The exact statement depends on the column type, maximum length, and other properties. The above line is just an example for a `VARCHAR` column.)
 */
class m200604_071428_alter_charset_logs extends Migration
{
    const TABLE_NAME = 'logs';

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->db->createCommand(
            'ALTER TABLE ' . self::TABLE_NAME . ' CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
        )->execute();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->db->createCommand('ALTER TABLE ' . self::TABLE_NAME . ' CONVERT TO CHARACTER SET utf8')->execute();

        // Фикс автопребразований текстовых полей в mediumtext
        $this->alterColumn(self::TABLE_NAME, 'informationType', $this->string(255)); // вместо tinytext
        $this->alterColumn(self::TABLE_NAME, 'file', $this->text());
        $this->alterColumn(self::TABLE_NAME, 'info', $this->string(255)); // вместо tinytext
    }
}
