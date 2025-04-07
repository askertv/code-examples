<?php

use yii\db\Migration;

/**
 * Class m200417_102817_states
 */
class m200417_102817_states extends Migration
{
    const TABLE_NAME = 'states';

    public function up()
    {
        $this->createTable(
            self::TABLE_NAME,
            [
                'id' => $this->primaryKey(),
                'state' => $this->string(255)->notNull()->defaultValue(''),
                'nonce' => $this->string(255)->notNull()->defaultValue(''),
                'link_type' => "ENUM('sms', 'token') NOT NULL DEFAULT 'sms'",
                'code_is_set' => $this->tinyInteger()->notNull()->defaultValue(0),
                'ip' => $this->string(15)->notNull()->defaultValue(''),
                'user_agent' => $this->string(255)->notNull()->defaultValue(''),
                'date_added' => $this->datetime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
                'date_response' => $this->datetime()->notNull()->defaultValue('1000-01-01 00:00:00')
            ],
            'ENGINE=InnoDB DEFAULT CHARSET=UTF8'
        );
        $this->createIndex('state', self::TABLE_NAME, 'state', true);
        $this->createIndex('nonce', self::TABLE_NAME, 'nonce', true);
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
