<?php

use yii\db\Migration;

/**
 * Class m181225_135735_update_ws_statuses
 */
class m181225_135735_update_ws_statuses extends Migration
{
    const TABLE_NAME = 'update_ws_statuses';

    public function up()
    {
        /**
         * @see wiki/display/PRDS/Yii+migrations
         */
        $this->createTable(
            self::TABLE_NAME,
            [
                'ws_name' => $this->string(100)->notNull()->defaultValue(''),
                'user' => $this->string(100)->notNull()->defaultValue(''),
                'date_start' => $this->datetime()->notNull()->defaultValue('1000-01-01 00:00:00'),
                'date_end' => $this->datetime()->notNull()->defaultValue('1000-01-01 00:00:00'),
                'status' => "ENUM('process', 'success', 'error', 'idle') NOT NULL DEFAULT 'idle'",
                'message' => $this->text()->notNull(),
                'date_added' => $this->datetime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
                'last_update' => $this->datetime()->notNull()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ],
            'ENGINE=InnoDB DEFAULT CHARSET=UTF8'
        );
        $this->createIndex('ws_name', self::TABLE_NAME, 'ws_name');
        $this->createIndex('status', self::TABLE_NAME, 'status');
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
