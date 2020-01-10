export default class GalleryItem {
  url: string;
  title: string;
  principal: string;

  constructor(url: string, title: string, principal: string) {
    this.url = url;
    this.title = title;
    this.principal = principal;
  }
}