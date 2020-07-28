export const defaultArtworks = [
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-3064.jpg",
        "id": "U0stQS0zMDY0",
        "Title": "Portrait of a Girl Dressed in Blue",
        "defaultCulture": "japanese",
        "defaultMedium": "precious"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/545088.jpg",
        "Title": "Scarab",
        "id": "NTQ1MDg4",
        "defaultCulture": "greek",
        "defaultMedium": "paper"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/363552.jpg",
        "Title": "Illuminated Letter D within a Decorated Border",
        "id": "MzYzNTUy",
        "defaultCulture": "chinese",
        "defaultMedium": "woodwork"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/BK-1978-878.jpg",
        "Title": "Double Face Banyan",
        "id": "QkstMTk3OC04Nzg=",
        "defaultCulture": "ancient_american",
        "defaultMedium": "musical_instruments"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/10158.jpg",
        "Title": "Sunrise on the Matterhorn",
        "id": "MTAxNTg=",
        "defaultCulture": "greek",
        "defaultMedium": "paper"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/437685.jpg",
        "Title": "The Road from Versailles to Louveciennes",
        "id": "NDM3Njg1",
        "defaultCulture": "russian",
        "defaultMedium": "prints"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/BK-16394-R-2.jpg",
        "Title": "Saucer with a putto on clouds",
        "id": "QkstMTYzOTQtUi0y",
        "defaultCulture": "ancient_european",
        "defaultMedium": "accessories"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/205288.jpg",
        "Title": "Tureen with cover in the form of a turkey",
        "id": "MjA1Mjg4",
        "defaultCulture": "chinese",
        "defaultMedium": "stone"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/249477.jpg",
        "Title": "Tile mosaic with rabbit, lizard and mushroom",
        "id": "MjQ5NDc3",
        "defaultCulture": "american",
        "defaultMedium": "drawings"

    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/BK-1973-268.jpg",
        "Title": "Kokarde van veren in de kleuren oranje en blauw in de vorm van een rozet",
        "id": "QkstMTk3My0yNjg=",
        "defaultCulture": "south_asian",
        "defaultMedium": "drawings"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-T-1941-89.jpg",
        "Title": "Portrait of Edwin vom Rath’s Pug",
        "id": "UlAtVC0xOTQxLTg5",
        "defaultCulture": "african",
        "defaultMedium": "metalwork"
    },
    {
        "id": "UlAtVC0xOTE0LTE4LTM5",
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-T-1914-18-39.jpg",
        "Title": "Lachenalia aloides (L.f.) Engl. var. aurea (Opal flower)",
        "defaultCulture": "german",
        "defaultMedium": "precious"
    },
    {
        "id": "NTQ0MjEx",
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/544211.jpg",
        "Title": "Model Paddling Boat",
        "defaultCulture": "swiss",
        "defaultMedium": "photographs"
    },
    {
        "id": "OTQ4Mw==",
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/9483.jpg",
        "Title": "Vase",
        "defaultCulture": "austrian",
        "defaultMedium": "textiles"
    },
    {
        "id": "NTQ0NTA5",
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/544509.jpg",
        "Title": "Menat necklace from Malqata",
        "defaultCulture": "southeast_asian",
        "defaultMedium": "prints"
    }

]

interface StringMap {
    [key: string]: any;
}

export const idToArtwork: StringMap = defaultArtworks.reduce((o, artwork) => Object.assign(o, { [artwork.id]: artwork }), {});
