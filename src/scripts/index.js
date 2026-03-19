/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import {
  getCardList,
  getUserInfo,
  setUserInfo,
  setUserAvatarInfo,
  addNewCard,
} from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description",
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalLikesList =
  cardInfoModalWindow.querySelector(".popup__list");
const cardInfoModalInfoListItem = document.querySelector(
  "#popup-info-definition-template",
);
const cardInfoModalLikesListItem = document.querySelector(
  "#popup-info-user-preview-template",
);

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  evt.submitter.textContent = "Изменение...";
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setProfileData({
        name: userData.name,
        about: userData.about,
      });
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => (evt.submitter.textContent = "Сохранить"));
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  evt.submitter.textContent = "Загрузка...";
  setUserAvatarInfo({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      setAvatarProfileData(userData.avatar);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => (evt.submitter.textContent = "Сохранить"));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  evt.submitter.textContent = "Создание...";
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          {
            name: cardData.name,
            link: cardData.link,
          },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: likeCard,
            onDeleteCard: deleteCard,
          },
        ),
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => (evt.submitter.textContent = "Сохранить"));
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    cards.forEach((data) => {
      placesWrap.append(
        createCardElement(
          data,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: likeCard,
            onDeleteCard: deleteCard,
            onInfoIcon: handleInfoClick,
          },
          userData._id,
        ),
      );
      setProfileData({
        name: userData.name,
        about: userData.about,
      });
      setAvatarProfileData(userData.avatar);
    }); // Код отвечающий за отрисовку полученных данных
  })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  });

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (definition, description) => {
  const infoString = cardInfoModalInfoListItem.content.querySelector(".popup__info-item").cloneNode(true);
  infoString.querySelector(".popup__info-term").textContent = definition;
  infoString.querySelector(".popup__info-description").textContent =
    description;
  return infoString;
};

const createInfoListItem = (name) => {
  const listItem = cardInfoModalLikesListItem.content.querySelector(".popup__list-item_type_badge").cloneNode(true);
  listItem.textContent = name;
  return listItem;
};

const handleInfoClick = (cardId) => {
  /* Для вывода корректной информации необходимо получить актуальные данные с сервера. */
  getCardList()
    .then((cards) => {
      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalLikesList.innerHTML = "";

      const cardData = cards.find((card) => card._id === cardId);
      cardInfoModalWindow.querySelector(".popup__title").textContent =
        "Информация о карточке";
      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
      );
      cardInfoModalInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt)),
        ),
      );
      cardInfoModalInfoList.append(
        createInfoString("Владелец:", cardData.owner.name),
      );
      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length),
      );

      cardInfoModalWindow.querySelector(".popup__text").textContent =
        "Лайкнули:";
      cardData.likes.forEach((human) => {
        cardInfoModalLikesList.append(createInfoListItem(human.name));
      });
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const setProfileData = ({ name, about }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
};

const setAvatarProfileData = (avatar) => {
  profileAvatar.style.backgroundImage = `url('${avatar}')`;
};
