import escapeHtml from './utils/escape-html.js';
import { fetchJson, patchJson, putJson, uploadImage } from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  product = {
    id: '',
    title: '',
    description: '',
    quantity: 0,
    subcategory: '',
    images: [],
    price: 0,
    discount: 0,
    status: 1,
  }

  uploadImageEvent = async event => {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = async e => { 
      const file = e.target.files[0]; 
      const result = await uploadImage(file);
      this.addImageToList(result.data.link, file.name);
    };

    input.click();
  }

  removeImageEvent = event => {
    const imageElement = event.target.closest('.sortable-list__item');
    const deleteButton = event.target.closest('.sortable-table__cell__delete-button');
    if (deleteButton)
      imageElement.remove();
  }

  submit = async event => {
    event.preventDefault();
    await this.save();
  }

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    await this.fetchData();

    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.addEventListeners();
    this.fillFormData();

    return this.element;
  }
  
  async fetchData() {
    const [categories, items] = await Promise.all([this.fetchCategories(), 
      this.productId ? this.fetchItemData() : Promise.resolve([this.product])]);
    this.categories = categories;
    this.product = items[0];
  }

  fetchCategories() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.append('_sort', 'weight');
    url.searchParams.append('_refs', 'subcategory');

    return fetchJson(url);
  }

  fetchItemData() {
    const url = new URL('api/rest/products', BACKEND_URL);
    url.searchParams.append('id', this.productId);

    return fetchJson(url);
  }

  fetchItemData() {
    const url = new URL('api/rest/products', BACKEND_URL);
    url.searchParams.append('id', this.productId);

    return fetchJson(url);
  }

  fillFormData() {
    const { productForm, imageListContainer } = this.subElements;

    productForm.elements.title.value = this.product.title;
    productForm.elements.description.value = this.product.description;
    productForm.elements.price.value = this.product.price;
    productForm.elements.discount.value = this.product.discount;
    productForm.elements.quantity.value = this.product.quantity;
    productForm.elements.status.value = this.product.status;
    imageListContainer.innerHTML = this.buildImageListElement();

    this.buildCategoriesOptionElements().map(option => productForm.elements.subcategory.add(option));
  }

  buildImageListElement() {
    const imageElements = [];

    for (const image of this.product.images ?? []) {
      const imageElement = this.buildImageElement(image.url, image.source);
      imageElements.push(imageElement);
    }

    return `
      <ul class="sortable-list">
        ${imageElements.join('')}
      </ul>
    `;
  }

  addImageToList(url, source) {
    const imageElement = this.buildImageElement(url, source);
    const [imageList] = this.subElements.imageListContainer.children;
    imageList.innerHTML += imageElement;
  }

  buildImageElement(url, source) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button" class="sortable-table__cell__delete-button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  buildCategoriesOptionElements() {
    const optionElements = [];

    for (const cat of this.categories) {
      for (const subCat of cat.subcategories) {
        const selected = this.product.subcategory === subCat.id;
        const option = new Option(`${cat.title} > ${subCat.title}`, subCat.id, selected, selected);
        optionElements.push(option);
      }
    }

    return optionElements;
  }

  async save() {
    const productObj = this.getFormData();
    const json = JSON.stringify(productObj);
    const url = new URL('api/rest/products', BACKEND_URL);

    const [request, eventName] = this.productId ? [putJson, 'product-updated'] : [patchJson, 'product-saved'];
    const result = await request(url, json);
    this.element.dispatchEvent(new Event(eventName));
  }
      
  getFormData() {
    const { title, description, price, discount, subcategory, status, quantity } = this.subElements.productForm.elements;

    const result = {
      description: description.value,
      discount: Number(discount.value),
      images: [],
      price: Number(price.value),
      quantity: Number(quantity.value),
      status: Number(status.value),
      subcategory: subcategory.value,
      title: title.value,
    };

    if (this.productId) {
      result.id = this.productId;
    }

    const imageElements = this.subElements.imageListContainer.querySelectorAll('.sortable-list__item');

    for (const imageElement of imageElements) {
      const [urlElement, srcElement] = imageElement.children;
      result.images.push({ url: urlElement.value, source: srcElement.value });
    }

    return result;
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
              <div data-element="imageListContainer">
                <ul class="sortable-list">
                </ul>
              </div>
            <button type="button" name="uploadImage" data-element="uploadImageButton" class="button-primary-outline">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory">
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="0">Неактивен</option>
              <option value="1">Активен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" data-element="submitButton" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }
  
  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  addEventListeners() {
    this.subElements.uploadImageButton.addEventListener('click', this.uploadImageEvent);
    this.subElements.imageListContainer.addEventListener('click', this.removeImageEvent);
    this.subElements.submitButton.addEventListener('click', this.submit);
  }

  remove() {
    this.element?.remove();
  }

  destroy () {
    this.element?.remove();
    this.element = null;
    this.subElements = null;
  }
}
