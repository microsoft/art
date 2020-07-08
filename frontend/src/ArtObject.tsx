/**
 * Internal representation of an artwork
 */
export default class ArtObject {

    Artist: string;
    Classification: string;
    Culture: string;
    Image_Url: string;
    Museum: string;
    Museum_Page: string;
    Thumbnail_Url: string;
    Title: string;
    id: string;

    constructor(
        Artist: string,
        Classification: string,
        Culture: string,
        Image_Url: string,
        Museum: string,
        Museum_Page: string,
        Thumbnail_Url: string,
        Title: string,
        id: string
    ) {
        this.Artist = Artist;
        this.Classification = Classification;
        this.Culture = Culture;
        this.Image_Url = Image_Url;
        this.Museum = Museum;
        this.Museum_Page = Museum_Page;
        this.Thumbnail_Url = Thumbnail_Url;
        this.Title = Title;
        this.id = id;
    }
}