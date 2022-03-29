export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sortFunctions = {};
    this.sortFunctions.string = this.sortStrings;
    this.sortFunctions.number = this.sortNumbers;

    this.build();
  }

  build() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  sort(field, sortDirection) {
    const header = this.headerConfig.find(h => h.id === field);

    if (!header.sortable) {
      return;
    }

    this.data = this.sortValues(this.data, field, header.sortType, sortDirection);
    this.sortedField = header.id;
    this.sortDirection = sortDirection;
    this.element.innerHTML = this.getTemplate();
    this.subElements = this.getSubElements();
  }

  sortValues(arr, field, sortType = 'string', param = 'asc') {
    const sortDirection = param !== 'desc' ? 1 : -1;
    const sortFunction = this.sortFunctions[sortType];
    return [...arr].sort(sortFunction(arr, field, sortDirection));
  }

  getTemplate() {
    return `
      <div class="sortable-table">
    
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaders().join('')}
        </div>
    
        <div data-element="body" class="sortable-table__body">
          ${this.getRows().join('')}
        </div>
    
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

  getHeaders() {
    return this.headerConfig.map(h => this.getHeader(h));
  }

  getHeader(header) {
    const sortArrow = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    const dataOrder = this.sortDirection ? `data-order="${this.sortDirection}` : '';

    return `
      <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" ${dataOrder}">
        <span>${header.title}</span>
        ${this.sortedField === header.id ? sortArrow : ''}
      </div>
    `;
  }

  getRows() {
    return this.data.map(i => this.getRow(i));
  }

  getRow(item) {
    return `
      <a href="#" class="sortable-table__row">
        ${this.headerConfig.map(h => this.getCell(h, item)).join('')}
      </a>
    `;
  }

  getCell(header, item) {
    if (header.id === 'images') {
      return header.template(item);
    }

    return `<div class="sortable-table__cell">${item[header.id]}</div>`;
  }

  sortNumbers(arr, field, direction) {
    return (a, b) => direction * (a[field] - b[field]);
  }

  sortStrings(arr, field, direction) {
    return (a, b) => direction * a[field].localeCompare(b[field], 'ru-en', { caseFirst: 'upper' });
  }

  destroy () {
    this.element?.remove();
    this.element = null;
  }
}
