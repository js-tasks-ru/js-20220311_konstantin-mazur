export default class NotificationMessage {
  static activeNotification;

  constructor(message = '', { duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.build();
  }

  build() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(targetElement = document.body) {
    NotificationMessage.activeNotification?.remove();
    NotificationMessage.activeNotification = this;

    targetElement.append(this.element);

    this.timeoutId = setTimeout(() => this.remove(), this.duration);
  }

  getTemplate() {
    return `  
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>`;
  }

  remove () {
    this.element?.remove();
    clearTimeout(this.timeoutId);
  }

  destroy () {
    this.remove();
    this.element = null;
  }
}
