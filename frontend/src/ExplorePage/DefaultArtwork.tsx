import { lookup } from "../Shared/SearchTools";
import {ArtMatch} from "../Shared/ArtSchemas";

export const defaultArtworks = [
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-3064.jpg",
        "id": "U0stQS0zMDY0",
        "Title": "Portrait of a Girl Dressed in Blue"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-3905.jpg",
        "id": "U0stQS0zOTA1",
        "Title": "Portrait of Arnoldus van Rijneveld"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-406.jpg",
        "id": "U0stQS00MDY=",
        "Title": "Portrait of Anne of Hanover, Princess Royal and Princess of Orange, Consort of Prince William IV"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-4020.jpg",
        "id": "U0stQS00MDIw",
        "Title": "Portrait of a Man"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-1048.jpg",
        "id": "U0stQS0xMDQ4",
        "Title": "Portrait of Emma Jane Hodges"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-C-1183.jpg",
        "id": "U0stQy0xMTgz",
        "Title": "Jacobus Govaerts (b. 1635/36). Appointed Master of Ceremonies and Clerk of the Chapter of Antwerp in 1661."
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-F-F01161-N.jpg",
        "id": "UlAtRi1GMDExNjEtTg==",
        "Title": "Portret van twee Japanse vrouwen, met kamerschermen en dienbladen met serviesgoed"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-T-2005-170.jpg",
        "id": "UlAtVC0yMDA1LTE3MA==",
        "Title": "Portret van Johan Daniël Koelman"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/AK-RAK-2014-6.jpg",
        "id": "QUstUkFLLTIwMTQtNg==",
        "Title": "Daoist Deity"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-3779.jpg",
        "id": "U0stQS0zNzc5",
        "Title": "Johannes Thedens (1741-1743)"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-T-2016-11-2.jpg",
        "id": "UlAtVC0yMDE2LTExLTI=",
        "Title": "Wilhelmina Hillegonda Schuyt"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-F-F01184-AR.jpg",
        "id": "UlAtRi1GMDExODQtQVI=",
        "Title": "Detail van het beeld Venus Victrix door Antonio Canova"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-4342.jpg",
        "id": "U0stQS00MzQy",
        "Title": "Wilhelmina Carolina (Carolina; 1743-87), prinses van Oranje-Nassau, dochter van Willem IV en zuster van Willem V, als kind"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-P-1936-453.jpg",
        "id": "UlAtUC0xOTM2LTQ1Mw==",
        "Title": "Vrouw in Galata krijgt een sluier"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-P-1920-2701.jpg",
        "id": "UlAtUC0xOTIwLTI3MDE=",
        "Title": "Engelse vrouw met schaartje aan ceintuur"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-2963.jpg",
        "id": "U0stQS0yOTYz",
        "Title": "Portrait of Don Ramón Satué"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-T-1914-17-69.jpg",
        "id": "UlAtVC0xOTE0LTE3LTY5",
        "Title": "A Xhosa (possibly Gonaqua) chieftan’s wife with an infant on her back"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-4221.jpg",
        "id": "U0stQS00MjIx",
        "Title": "Portrait of a Woman"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-F-00-7520.jpg",
        "id": "UlAtRi0wMC03NTIw",
        "Title": "Portret van Juliana, koningin der Nederlanden"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-T-00-1180.jpg",
        "id": "UlAtVC0wMC0xMTgw",
        "Title": "Portret van een vrouw met handschoenen en ketting met houder voor een bezoarsteen (?)"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/BK-1975-35.jpg",
        "id": "QkstMTk3NS0zNQ==",
        "Title": "Figure of Venus and Amor"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/BK-1961-111.jpg",
        "id": "QkstMTk2MS0xMTE=",
        "Title": "Japon van drie lagen crêpe georgette"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-3064.jpg",
        "id": "U0stQS0zMDY0",
        "Title": "Portrait of a Girl Dressed in Blue"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/BK-14649-B.jpg",
        "id": "QkstMTQ2NDktQg==",
        "Title": "Gown with a belt"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/BK-C-1994-1.jpg",
        "id": "QkstQy0xOTk0LTE=",
        "Title": "Portrait Bust of Johann Neudörfer the Younger"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-5049.jpg",
        "id": "U0stQS01MDQ5",
        "Title": "Crucifixion of Christ, with the Virgin and St John"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/NG-2016-50-2.jpg",
        "id": "TkctMjAxNi01MC0y",
        "Title": "Prentbriefkaart uit album 'Als aandenken aan Suriname'"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/AK-MAK-9.jpg",
        "id": "QUstTUFLLTk=",
        "Title": "Ritual bell"
    },
    {
        "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/SK-A-233.jpg",
        "id": "U0stQS0yMzM=",
        "Title": " Portrait of Catherine Bégon"
    }
]

export const defaultIds: string[] = defaultArtworks.map(info => info.id)
