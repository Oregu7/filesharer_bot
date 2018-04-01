/*
    ЧАВО

    [1] /add - Добавление файла. В виде Scene 
    1) Кидаем файл (фото, видео, аудио, документ, голосовое сообщение)
    2) Название файла - автоматом или изменяем
    3) Описание (опционально)
    4) Пароль (опционально)
    5) Опции - в виде переключателей InlineButton:
        - Отображать автора
        - Отображать дату
        - Отображать колличество просмотров
        - Отображать лайки/дизлайки
    6) Создаем файл и даем на него ссылку https://t.me/filesharer_bot?start=publicId
    Так, же описваем возможность поделиться с помощью inline-mode
    @filesharer_bot file:publicId 
        => 
        File.name
        File.desc
        [urlbutton = "https://t.me/filesharer_bot?start=publicId"]

    [2] /files - список файлов пользователя
    [в виде списка (смотри в mymanga)]
    [в виде поиска через inline-mode]

    [3] Файл, /file@${publicId}
    1) Изменить название
    2) Изменить описание
    3) Опции
    // м.б премиум функция
    4) Статистика => скачиваем в виде .xls, .csv, .json, .xml (Кто и когда скачивал)
    5) Удалить файл
*/

const startController = require("./startController");
const addController = require("./addController");
const addFileController = require("./addFileController");
const callbackController = require("./callbackController");
const inlineQueryController = require("./inlineQueryController");
const fileController = require("./fileController");
const filesController = require("./filesController");
const langController = require("./langController");
const rateController = require("./rateController");
const feedbackController = require("./feedbackController");
const helpController = require("./helpController");
const downloadConreoller = require("./downloadController");

module.exports = {
    startController,
    addController,
    addFileController,
    fileController,
    filesController,
    langController,
    rateController,
    feedbackController,
    helpController,
    downloadConreoller,
    callbackController,
    inlineQueryController,
};