import "./style.css";
import { getCards, addCard, updateCard, deleteCard } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const cards = await getCards();
  console.log("Cards cargadas:", cards);
});