<?php

use yii\db\Migration;

/**
 * Таблица для фичи "Получение уникального референса"
 */
class m190606_172117_get_references extends Migration
{
    const TABLE_NAME = 'get_references';

    /**
     * @see https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html#sql-mode-strict
     *
     * Strict mode affects whether the server permits '0000-00-00' as a valid date:
     *   - If strict mode is not enabled, '0000-00-00' is permitted and inserts produce no warning.
     *   - If strict mode is enabled, '0000-00-00' is not permitted and inserts produce an error,
     *       unless IGNORE is given as well. For INSERT IGNORE and UPDATE IGNORE,
     *       '0000-00-00' is permitted and inserts produce a warning.
     */
    const DEFAULT_DATETIME = '1000-01-01 00:00:00';

    public function up()
    {
        /**
         * @see wiki/display/PRDS/Yii+migrations
         */
        $this->createTable(
            self::TABLE_NAME,
            [
                'id' => $this->primaryKey(),
                'reference' => $this->integer()->notNull()->defaultValue(0),
                'gen_date' => $this->datetime()->notNull()->defaultValue(self::DEFAULT_DATETIME),
                'ip' => $this->string(15)->notNull()->defaultValue('')
            ],
            'ENGINE=InnoDB DEFAULT CHARSET=UTF8'
        );
        $this->createIndex('reference', self::TABLE_NAME, 'reference');
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
