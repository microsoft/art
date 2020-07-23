/**
 * Internal representation of an artwork
 */
export class ArtObject {

    Artist: string;
    Classification: string;
    Culture: string;
    Image_Url: string;
    Museum: string;
    Museum_Page: string;
    Thumbnail_Url: string;
    Title: string;
    id: string | null;

    constructor(
        Artist: string,
        Classification: string,
        Culture: string,
        Image_Url: string,
        Museum: string,
        Museum_Page: string,
        Thumbnail_Url: string,
        Title: string,
        id: string | null
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

export const loadingArtwork = new ArtObject("", "", "", "images/loading.jpg", "", "", "images/loading.jpg", "Loading", null)

export class ArtMatch {
    Thumbnail_Url: string;
    id: string | null;

    constructor(
        Thumbnail_Url: string,
        id: string | null
    ) {
        this.Thumbnail_Url = Thumbnail_Url;
        this.id = id;
    }
}

export const loadingMatch = new ArtMatch("images/loading.jpg", null)