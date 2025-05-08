"use strict";

// seleção de elementos HTML
const dessertsContainer = document.querySelector(".desserts-container");
const cartContainer = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const cartTotalPrice = document.querySelector(".cart-total-price");
const cartSelected = document.querySelector(".cart-selected");
const cartEmpty = document.querySelector(".cart-empty");

// arrays para armazenar os dados dos itens no carrinho e dados dos doces
let cartItems = [];
let dessertsData = [];

// função: busca os dados do JSON e popula os itens de sobremesas
fetch("data.json")
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.statusText}`);
    }
    return res.json();
  })
  .then((data) => {
    dessertsData = data; // armazenar dados recebidos do JSON
    addItems(data); // xibir os itens de sobremesas na página
  })
  .catch((err) => {
    dessertsContainer.innerHTML = `Error fetching data: ${err.message}`; // caso de erro na busca dos dados
  });

// função: adicionar os itens de sobremesa na tela
function addItems(data) {
  let html = "";

  data.forEach((item, index) => {
    html += `
    <div class="desserts-item">
      <div class="desserts-content">
        <picture class="desserts-picture">
          <source media="(min-width: 77.5rem)" srcset="${item.image.desktop}" />
          <source media="(min-width: 43.125rem)" srcset="${item.image.tablet}" />
          <img class="desserts-image" src="${item.image.mobile} alt="${item.name}" data-index="${index}"/>
        </picture>
    
        <div class="desserts-actions">
          <button class="desserts-cart-btn">
            <img src="assets/images/icon-add-to-cart.svg" alt="" />
            Add to Cart
          </button>
    
          <div class="desserts-quantity" style="display: none;">
            <button class="desserts-qty-decrement qty-crement">
              <img src="assets/images/icon-decrement-quantity.svg" alt="decremento">
            </button>
            <span class="desserts-qty-value" data-index="${index}">1</span>
            <button class="desserts-qty-increment qty-crement">
              <img src="assets/images/icon-increment-quantity.svg" alt="incremento">
            </button>
          </div>
        </div>
      </div>
    
      <div class="desserts-info">
        <p class="desserts-category">${item.category}</p>
        <h2 class="desserts-name">${item.name}</h2>
        <p class="desserts-price">$${item.price.toFixed(2)}</p>
      </div>
    </div>
    `;
  });

  // add o HTML gerado ao contêiner de sobremesas
  dessertsContainer.innerHTML = html;

  // add os eventos de clique nos botões de carrinho e quantidade
  document.querySelectorAll(".desserts-cart-btn").forEach((btn) => {
    btn.addEventListener("click", handleClick);
  });

  document.querySelectorAll(".desserts-qty-decrement").forEach((btn) => {
    btn.addEventListener("click", valDecrement);
  });

  document.querySelectorAll(".desserts-qty-increment").forEach((btn) => {
    btn.addEventListener("click", valIncrement);
  });
}

// função: item adicionado ao carrinho
function handleClick(event) {
  const clickedButton = event.currentTarget;
  const parentItem = clickedButton.closest(".desserts-item");
  const itemIndex = parentItem.querySelector(".desserts-image").dataset.index;
  const itemName = parentItem.querySelector(".desserts-name").textContent;
  const itemPrice = parseFloat(
    parentItem.querySelector(".desserts-price").textContent.replace("$", "")
  );

  // esconde o botão de adicionar e exibe a quantidade
  clickedButton.style.display = "none";
  const quantityContainer = parentItem.querySelector(".desserts-quantity");
  quantityContainer.style.display = "flex";

  // marca a imagem como selecionada
  const imageToSelect = document.querySelector(
    `.desserts-image[data-index="${itemIndex}"]`
  );
  if (imageToSelect) {
    imageToSelect.classList.add("selected");
  }

  // vê se item já existe no carrinho e atualiza quantidade ou adiciona novo item
  const existingItem = cartItems.find((item) => item.index === itemIndex);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      index: itemIndex,
      name: itemName,
      price: itemPrice,
      quantity: 1,
    });
  }

  // atualiza o carrinho
  updateCart();
}

// função: incrementar a quantidade do item no carrinho
function valIncrement(event) {
  const clickedButton = event.currentTarget;
  const parentItem = clickedButton.closest(".desserts-item");
  const valueIndex = parentItem.querySelector(".desserts-qty-value");

  let val = parseInt(valueIndex.textContent, 10);
  valueIndex.textContent = val + 1;

  const itemIndex = parentItem.querySelector(".desserts-image").dataset.index;
  const existingItem = cartItems.find((item) => item.index === itemIndex);
  if (existingItem) {
    existingItem.quantity += 1;
  }
  updateCart();
}

// função: decrementar a quantidade do item no carrinho.
function valDecrement(event) {
  const clickedButton = event.currentTarget;
  const parentItem = clickedButton.closest(".desserts-item");
  const valueIndex = parentItem.querySelector(".desserts-qty-value");

  let val = parseInt(valueIndex.textContent, 10);

  if (val > 1) {
    valueIndex.textContent = val - 1;

    const itemIndex =
      parentItem.querySelector(".desserts-image").dataset.index;
    const existingItem = cartItems.find((item) => item.index === itemIndex);
    if (existingItem) {
      existingItem.quantity -= 1;
    }
  } else {
    const quantityContainer = parentItem.querySelector(".desserts-quantity");
    quantityContainer.style.display = "none";
    parentItem.querySelector(".desserts-cart-btn").style.display = "flex";

    const itemIndex =
      parentItem.querySelector(".desserts-image").dataset.index;
    const existingItemIndex = cartItems.findIndex(
      (item) => item.index === itemIndex
    );
    if (existingItemIndex !== -1) {
      cartItems.splice(existingItemIndex, 1);
      const imageToDeselect = document.querySelector(
        `.desserts-image[data-index="${itemIndex}"]`
      );
      if (imageToDeselect) {
        imageToDeselect.classList.remove("selected");
      }
    }
  }
  updateCart();
}

// função: atualiza exibição do carrinho de compras
function updateCart() {
  cartContainer.innerHTML = "";
  let totalPrice = 0;

  // para cada item no carrinho, criar item visual na tela
  cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
    cartContainer.innerHTML += `
    <div class="cart-item-wrap">
      <div class="cart-item">
        <div class="cart-item-text">
          <p class="cart-item-name">${item.name}</p>
          <div class="cart-item-info">
            <p class="cart-item-qty">${item.quantity}x</p>
            <div class="cart-item-prices">
              <span class="cart-item-price-unit">@$${item.price.toFixed(2)}</span>
              <span class="cart-item-price-total">$${(
                item.price * item.quantity
              ).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button class="cart-remove-btn" data-index="${item.index}">
          <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1.25C5.125 1.25 1.25 5.125 1.25 10C1.25 14.875 5.125 18.75 10 18.75C14.875 18.75 18.75 14.875 18.75 10C18.75 5.125 14.875 1.25 10 1.25ZM10 17.5C5.875 17.5 2.5 14.125 2.5 10C2.5 5.875 5.875 2.5 10 2.5C14.125 2.5 17.5 5.875 17.5 10C17.5 14.125 14.125 17.5 10 17.5Z" fill="#AD8A85"/>
            <path d="M13.375 14.375L10 11L6.625 14.375L5.625 13.375L9 10L5.625 6.625L6.625 5.625L10 9L13.375 5.625L14.375 6.625L11 10L14.375 13.375L13.375 14.375Z" fill="#AD8A85"/>
          </svg>
        </button>
      </div>
      <hr class="cart-divider" />
    </div>
    `;
  });

  cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;

  if (cartItems.length > 0) {
    cartEmpty.style.display = "none";
    cartSelected.style.display = "flex";
  } else {
    cartEmpty.style.display = "flex";
    cartSelected.style.display = "none";
  }

  cartCount.textContent = cartItems.length;

  // add eventos de remoção de item do carrinho
  document.querySelectorAll(".cart-remove-btn").forEach((btn) => {
    btn.addEventListener("click", removeCartItem);
    updateDialogContent();
  });
}

// função: remover um item do carrinho
function removeCartItem(event) {
  const clickedButton = event.currentTarget;
  const itemIndex = clickedButton.dataset.index;

  cartItems = cartItems.filter((item) => item.index !== itemIndex);
  updateCart();

  const parentItem = document
    .querySelector(
      `.desserts-item .desserts-image[data-index="${itemIndex}"]`
    )
    .closest(".desserts-item");
  parentItem.querySelector(".desserts-cart-btn").style.display = "flex";
  parentItem.querySelector(".desserts-quantity").style.display = "none";

  const quantityValue = parentItem.querySelector(".desserts-qty-value");
  if (quantityValue) {
    quantityValue.textContent = "1";
  }

  const imageToDeselect = document.querySelector(
    `.desserts-image[data-index="${itemIndex}"]`
  );
  if (imageToDeselect) {
    imageToDeselect.classList.remove("selected");
  }
}

// função: atualizar o conteúdo do diálogo do carrinho.
function updateDialogContent() {
  const dialogContent = document.querySelector(".dialog-cart");
  dialogContent.innerHTML = "";

  let totalPrice = 0;

  cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
    const dessert = dessertsData[item.index];

    dialogContent.innerHTML += `
    <div class="cart-item">
      <div class="cart-item-wrap">
        <img
          class="cart-item-image"
          src="${dessert.image.thumbnail}"
          alt="${item.name}"
        />
        <div class="cart-item-details">
          <p class="cart-item-name">${item.name}</p>
          <div class="cart-item-quantity">
            <p class="cart-item-qty">${item.quantity}x</p>
            <span class="cart-item-price-unit">@$${item.price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <span class="cart-item-price-total">$${(
        item.price * item.quantity
      ).toFixed(2)}</span>
    </div>
    `;
  });

  dialog.querySelector(
    ".cart-total-price"
  ).textContent = `$${totalPrice.toFixed(2)}`;
}