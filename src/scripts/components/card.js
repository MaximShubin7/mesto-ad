import { deleteCardFromServer, changeLikeCardStatus } from "./api";

export const likeCard = (data, cardElement, currentUserId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  changeLikeCardStatus(data._id, isLiked).then((data) => {
    countLikes(data, cardElement, currentUserId);
  });
};

export const deleteCard = (cardElement) => {
  deleteCardFromServer(cardElement._id);
  then(() => cardElement.remove());
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

const countLikes = (data, cardElement, currentUserId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  if (
    data.likes.some((human) => human._id === currentUserId) !=
    likeButton.classList.contains("card__like-button_is-active")
  ) {
    likeButton.classList.toggle("card__like-button_is-active");
  }
  cardElement.querySelector(".card__like-count").textContent =
    data.likes.length;
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoIcon },
  currentUserId,
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info",
  );
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete",
  );
  if (data.owner._id !== currentUserId) deleteButton.remove();
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(data, cardElement, currentUserId),
    );
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(data));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link }),
    );
  }

  if (onInfoIcon) {
    infoButton.addEventListener("click", () =>
      onInfoIcon(data._id),
    );
  }
    
  countLikes(data, cardElement, currentUserId);

  return cardElement;
};
