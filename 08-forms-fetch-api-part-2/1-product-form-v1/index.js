import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    await this.fetchData();

    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.fillFormData();

    return this.element;
  }
  
  async fetchData() {
    this.categories = await this.fetchCategories();
    const items = await this.fetchItemData();
    this.item = items[0];
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

  fillFormData() {
    const { productForm, imageListContainer } = this.subElements;

    productForm.elements.title.value = this.item.title;
    productForm.elements.description.value = this.item.description;
    productForm.elements.price.value = this.item.price;
    productForm.elements.discount.value = this.item.discount;
    productForm.elements.quantity.value = this.item.quantity;
    productForm.elements.status.value = this.item.status;
    imageListContainer.innerHTML = this.buildImageListElement();

    this.buildCategoriesOptionElements().map(option => productForm.elements.subcategory.add(option));
  }

  buildImageListElement() {
    const imageElements = [];

    for (const image of this.item.images ?? []) {
      const imageElement = `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
            <span>${image.source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `;

      imageElements.push(imageElement);
    }

    return `
      <ul class="sortable-list">
        ${imageElements.join('')}
      </ul>
    `;
  }

  buildCategoriesOptionElements() {
    const optionElements = [];

    for (const cat of this.categories) {
      for (const subCat of cat.subcategories) {
        const selected = this.item.subcategory === subCat.id;
        const option = new Option(`${cat.title} > ${subCat.title}`, cat.id, selected, selected);
        optionElements.push(option);
      }
    }

    return optionElements;
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
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
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
            <button type="submit" name="save" class="button-primary-outline">
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

  save() {
    const event = new Event("product-updated");
    this.element.dispatchEvent(event);
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
