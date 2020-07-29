export const azureSearchUrl = 'https://extern-search.search.windows.net/indexes/art-search-3/docs';
export const apiVersion = '2019-05-06'
export const azureSearchApiKey = '0E8FACE23652EB8A6634F02B43D42E55';
export const nMatches = 10;
export const simpleFields: string[] = ["Artist", "Classification", "Culture", "Image_Url", "Museum", "Museum_Page", "Thumbnail_Url", "Title", "id"]

// Options for filtering the art culture
export const cultures: string[] = [
    'african',
    'american',
    'ancient_american',
    'ancient_asian',
    'ancient_european',
    'ancient_middle_eastern',
    'asian',
    'austrian',
    'belgian',
    'british',
    'chinese',
    'czech',
    'dutch',
    'egyptian',
    'european',
    'french',
    'german',
    'greek',
    'iranian',
    'italian',
    'japanese',
    'latin_american',
    'middle_eastern',
    'roman',
    'russian',
    'south_asian',
    'southeast_asian',
    'spanish',
    'swiss',
    'various'
];

// Options for filtering the art medium
export const media: string[] = [
    'prints',
    'drawings',
    'ceramics',
    'textiles',
    'paintings',
    'accessories',
    'photographs',
    'glass',
    'metalwork',
    'sculptures',
    'weapons',
    'stone',
    'precious',
    'paper',
    'woodwork',
    'leatherwork',
    'musical_instruments',
    'uncategorized'
];


export function queryBase(query: string): Promise<any> {
    return fetch(azureSearchUrl + query, { headers: { "Content-Type": "application/json", 'api-key': azureSearchApiKey } })
        .then(function (response) {
            return response.json();
        })
}

export function lookupBase(artworkID: string, selectors: string[]): Promise<any> {
    console.log(artworkID)
    return queryBase(`/${artworkID}?api-version=${apiVersion}&$select=${selectors.join(",")}`)
}

export function lookupWithMatches(artworkID: string, cultureFilter: string, mediumFilter: string): Promise<any> {
    return lookupBase(artworkID, simpleFields.concat(["matches/culture/" + cultureFilter, "matches/medium/" + mediumFilter]))
}

export function lookup(artworkID: string): Promise<any> {
    return lookupBase(artworkID, simpleFields)
}

export function search(
    terms: string[],
    facetNames: string[],
    activeFilters: { [key: string]: Set<string> }
): Promise<any> {

    function filterTerm(col: any, values: any) {
        return `search.in(${col},  '${[...values].join("|")}', '|')`
    }

    let query = "?api-version=" + apiVersion
        + "&search=" + terms.join('|')
        + "&$select=" + simpleFields.join(",")
        + facetNames.map(f => "&facet=" + f + "%2Ccount%3A8").join("")

    let filtersToSearch = Object.entries(activeFilters).filter((val: any) => val[1].size > 0)

    if (filtersToSearch.length !== 0) {
        query = query + "&$filter=" + filtersToSearch.map(([col, values],) =>
            filterTerm(col, values)
        ).join(" or ")
    }

    return queryBase(query)
}

