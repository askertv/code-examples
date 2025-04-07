<?php

use yii\db\Migration;

/**
 * Class m190710_091119_NEWS_THEME_UL
 */
class m190710_091119_NEWS_THEME_UL extends Migration
{
    const TABLE_NAME = 'NEWS_THEME_UL';

    public function up()
    {
        $this->createTable(
            self::TABLE_NAME,
            [
                'NEWS_THEME_ID' => $this->primaryKey(),
                'TITLE' => $this->string(255), // вместо tinytext
                'TITLE_EN' => $this->string(255), // вместо tinytext
                'GROUP_ID' => $this->integer()->notNull()->defaultValue(1),
                'POS' => $this->integer()->notNull()->defaultValue(0),
            ],
            'ENGINE=InnoDB DEFAULT CHARSET=UTF8'
        );
        $this->createIndex('group_id', self::TABLE_NAME, 'GROUP_ID');

        $this->insert(self::TABLE_NAME, [
            'NEWS_THEME_ID' => 1,
            'TITLE' => 'Надпись 1',
            'POS' => 10
        ]);

        $this->insert(self::TABLE_NAME, [
            'NEWS_THEME_ID' => 2,
            'TITLE' => 'Надпись 2',
            'POS' => 20
        ]);

        $this->insert(self::TABLE_NAME, [
            'NEWS_THEME_ID' => 3,
            'TITLE' => 'Надпись 3',
            'POS' => 30
        ]);

        $this->update(self::TABLE_NAME, ['NEWS_THEME_ID' => 0], 'NEWS_THEME_ID = 3');
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
