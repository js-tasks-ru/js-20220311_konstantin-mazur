class Tooltip {

  onPointermove = (event) => {
    this.moveAt(event.pageX, event.pageY);
  }

  onPointerover = (event) => {
    const tooltip = event.target.dataset.tooltip;
    if (!tooltip)
      return;

    this.render(tooltip);
    document.addEventListener('pointermove', this.onPointermove);
  }

  onPointerout = (event) => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointermove);
  }

  constructor () {
    if (Tooltip.instance)
      return Tooltip.instance;

    this.createTooltipElement();
    Tooltip.instance = this;
  }

  createTooltipElement() {
    const element = document.createElement('div');
    element.classList.add('tooltip');
    element.style.position = 'absolute';
    element.style.zIndex = 1000;
    this.element = element;
  }

  initialize () {
    document.addEventListener('pointerover', this.onPointerover);
    document.addEventListener('pointerout', this.onPointerout);
  }

  render(tooltip = '') {
    this.element.textContent = tooltip;
    document.body.append(this.element);
  }

  moveAt(pageX, pageY) {
    this.element.style.left = pageX + 10 + 'px';
    this.element.style.top = pageY + 10 + 'px';
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
    document.removeEventListener('pointerover', this.onPointerover);
    document.removeEventListener('pointerout', this.onPointerout);
  }
}

export default Tooltip;
