<?php

namespace DashaMail;

use Bitrix\Main\Config\Configuration;
use GuzzleHttp\Client as HttpClient;

class Service
{
    const REQUEST_METHOD_GET = 'GET';
    const REQUEST_METHOD_POST = 'POST';

    const API_ACTION_CAMPAIGNS_GET = 'campaigns.get';
    const API_ACTION_LISTS_ADD_MEMBER = 'lists.add_member';

    private
        $apiHost,
        $apiKey,
        $env,
        $siteId,

        $errors = [],

        $userEmail = '',
        $userName = '',
        $userSurname = '',
        $organization = '',
        $position = '',
        $checkedFeeds = [],
        $checkedFeedsMap = [];

    public function __construct()
    {
        $dsConfig = Configuration::getValue('dashamail');
        $this->apiHost = $dsConfig['api_host'];
        $this->apiKey = $dsConfig['api_key'];

        $envConfig = Configuration::getValue('site_environment');
        switch ($envConfig)
        {
            case 'production':
                $this->env = 'PROD';
                break;

            case 'develop':
                $this->env = 'TEST';
                break;

            default:
                $this->env = '';
                break;
        }
    }

    public function setUserEmail(string $email)
    {
        $this->userEmail = $email;
    }

    public function setUserName(string $name)
    {
        $this->userName = $name;
    }

    public function setUserSurname(string $surname)
    {
        $this->userSurname = $surname;
    }

    public function setOrganization(string $organization)
    {
        $this->organization = $organization;
    }

    public function setPosition(string $position)
    {
        $this->position = $position;
    }

    public function setCheckedFeeds(array $checkedFeeds)
    {
        $this->checkedFeeds = $checkedFeeds;
    }

    public function execute()
    {
        $groupsToSubscribe = $this->getMailingIds($this->getMailingList('json'), $this->checkedFeeds);

        $userIsAdded = $this->addEmailToAddressBases($this->userEmail, $groupsToSubscribe['list_ids']);
        $resultTxt = [];
        foreach ($userIsAdded as $resultJson) {
            $resultTxt[] = json_decode($resultJson, true);
        }

        return json_encode($userIsAdded);
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getErrorsJson()
    {
        $errors = $this->getErrors();

        if (!empty($errors) && is_array($errors)) {
            return json_encode($errors);
        }

        return '{}';
    }

    private function getGroupId($data, $groupName)
    {
        foreach ($data['response']['data'] as $group) {
            if ($group['name'] == $groupName) {
                $groupId = $group['id'];
            }
        }

        return $groupId;
    }

    private function getMailingIds($data, $groupNamesArr)
    {
        $groupNumbers = [];
        $listIdNumbers = [];

        $checkedFeedsFliped = array_flip($this->checkedFeeds);
        $listsMap = [];

        $dataDecoded = json_decode($data, true);

        foreach ($groupNamesArr as $groupName) {
            foreach ($dataDecoded['response']['data'] as $responseItem) {
                if ($responseItem['name'] == "$groupName {$this->siteId} {$this->env}") {
                    $groupNumbers[] = $responseItem['id'];
                    $listIdNumbers[] = $responseItem['list_id'];

                    if (isset($checkedFeedsFliped[$groupName])) {
                        $listsMap[$responseItem['list_id']] = $checkedFeedsFliped[$groupName];
                    }
                }
            }
        }

        $listIdNumbersCorrect = [];
        foreach ($listIdNumbers as $listItem) {
            $startPos = stripos($listItem, ';i:');
            $startPos += 3;
            $finishPos = stripos($listItem, ';}');
            $finishPos += 2;
            $id = substr($listItem, $startPos, $finishPos - $startPos);

            if (!in_array((int)$id, $listIdNumbersCorrect)) {
                $listIdNumbersCorrect[] = (int)$id;
            }

            if (isset($listsMap[$listItem])) {
                $listsMap[(int)$id] = $listsMap[$listItem];
            }
        }

        $this->checkedFeedsMap = $listsMap;

        return [
            'mail_ids' => $groupNumbers,
            'list_ids' => $listIdNumbersCorrect
        ];
    }

    private function addEmailToAddressBases($email, $arrListIds)
    {
        $response = [];
        foreach ($arrListIds as $listId) {
            $response[] = $this->listsAddMember($listId, $email, 'json');
        }
        return $response;
    }

    private function listsAddMember($listId, $email, $format)
    {
        $url = 'method=' . self::API_ACTION_LISTS_ADD_MEMBER . '&format=' . $format;

        $postData = [
            'list_id' => $listId,
            'email' => $email
        ];

        $postData = array_merge($postData, $this->getSubscriptionDataMerge());

        $response = $this->request(
            $url,
            self::REQUEST_METHOD_POST,
            $postData
        );

        if ($response) {
            $responseArr = json_decode($response, true);

            if (isset($responseArr['response']['msg'])) {
                $msg = $responseArr['response']['msg'];
                if (isset($msg['type'])) {
                    if ($msg['type'] == 'error' || $msg['type'] == 'notice') {
                        $feedName = '';
                        if (isset($this->checkedFeedsMap[$listId])) {
                            $feedName = $this->checkedFeeds[ $this->checkedFeedsMap[$listId] ];
                        }

                        // Из-за повторной подписки, не будем выводить ошибку
                        // @see https://dashamail.ru/codes/
                        if ($msg['err_code'] != 7) {
                            $this->setError($msg['err_code'], $msg['text'] . ($feedName ? " ($feedName)" : ''));
                        }
                    }
                }
            }
        }

        return $response;
    }

    private function getSubscriptionDataMerge(): array
    {
        $merges = [];

        if (!empty($this->userName)) {
            $merges['merge_1'] = $this->userName;
        }

        if (!empty($this->userSurname)) {
            $merges['merge_2'] = $this->userSurname;
        }

        if (!empty($this->organization)) {
            $merges['merge_3'] = $this->organization;
        }

        if (!empty($this->position)) {
            $merges['merge_4'] = $this->position;
        }

        if (!empty($this->checkedFeeds)) {
            $merges['merge_5'] = join(' ', $this->checkedFeeds);
        }

        return $merges;
    }

    private function getMailingList($format)
    {
        $url = 'method=' . self::API_ACTION_CAMPAIGNS_GET . '&format=' . $format;

        return $this->request($url, self::REQUEST_METHOD_GET);
    }

    private function request(string $action, string $requestMethod, array $data = []): string
    {
        $url = "{$this->apiHost}?api_key={$this->apiKey}&$action";

        $cURL = curl_init();
        curl_setopt($cURL, CURLOPT_URL, $url);
        curl_setopt($cURL, CURLOPT_RETURNTRANSFER, true);    
        curl_setopt($cURL, CURLOPT_TIMEOUT, 60);
        curl_setopt($cURL, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($cURL, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

        if ($requestMethod === self::REQUEST_METHOD_POST) {
            curl_setopt($cURL, CURLOPT_POST, true);
            curl_setopt($cURL, CURLOPT_POSTFIELDS, $data);
        }

        curl_setopt($cURL, CURLINFO_HEADER_OUT, true);
        $response = curl_exec($cURL);

        curl_close($cURL);

        return $response;
    }

    private function setError($code, $text)
    {
        $this->errors[] = $text;
    }
}
