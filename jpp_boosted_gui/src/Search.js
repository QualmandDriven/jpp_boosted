import React from 'react';
import Autosuggest from 'react-autosuggest';

import './Search.css';

async function getProjectSuggestions(value) {
    var prom;
    if (value === "") {
        prom = await fetch("/api/projects?limit=10")
            .then(r => r.json())
            .then(json => json)
            .catch(e => console.log(e));
    } else {
        if (value === undefined || value.value === undefined)
            return [];

        prom = await fetch("/api/projects?title=" + value.value)
            .then(r => r.json())
            .then(json => json)
            .catch(e => console.log(e));
    }

    if (prom === null)
        return [];
    return prom;
};

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            searchTerm: this.props.searchTerm !== undefined ? this.props.searchTerm : "",
            projectsList: [],
            selected: undefined,
         };

         getProjectSuggestions("").then(prjs => this.setState({ projectsList: prjs }));
    }

    submit = (e) => {
        e.preventDefault();
        this.props.onSubmit(this.state.searchTerm);
    }

    submitValue(e, value) {
        e.preventDefault();
        this.props.onSubmit(value);
    }

    onSearchChange = (event, value) => {
        this.setState({ selectedProject: this.state.projectsList.find(m => m.title === value.newValue), searchTerm: value.newValue });
    }



    onDeleteSearch = (e) => {
        e.preventDefault();
        this.setState({searchTerm: ""});
    }

    render() {
        var cancelButton = "";
        if(this.state.searchTerm !== undefined && this.state.searchTerm !== "") {
            cancelButton = <div className="input-group-btn">
                                <button onClick={this.onDeleteSearch} className="btn">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
        }

        return (
            <div>
                <form onSubmit={this.submit} id="search">
                    <div className="Search">
                        <Autosuggest
                            shouldRenderSuggestions={() => true}
                            suggestions={this.state.projectsList}
                            onSuggestionsFetchRequested={(value) => {
                                getProjectSuggestions(value).then(manus => this.setState({ projectsList: manus }));
                            }}
                            onSuggestionsClearRequested={() => getProjectSuggestions("").then(prjs => this.setState({ projectsList: prjs }))}
                            onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
                                this.setState({selected: suggestion, searchTerm: suggestionValue});
                                this.submitValue(event, suggestionValue);
                            }}
                            getSuggestionValue={(item) => item.title}
                            renderSuggestion={(item) => (
                                <div>
                                    {item.title}
                                </div>)}
                            inputProps={{
                                    placeholder: 'Nick, Hersteller, Modell...',
                                    value: this.state.searchTerm,
                                    onChange: this.onSearchChange
                                }}
                            theme={{
                                container:                  "search-react-autosuggest__container",
                                containerOpen:            'react-autosuggest__container--open',
                                input:                      "search-react-autosuggest__input",
                                inputOpen:                'react-autosuggest__input--open',
                                inputFocused:             'react-autosuggest__input--focused',
                                suggestionsContainer:     'react-autosuggest__suggestions-container',
                                suggestionsContainerOpen: 'search-react-autosuggest__suggestions-container--open',
                                suggestionsList:          'react-autosuggest__suggestions-list',
                                suggestion:               'react-autosuggest__suggestion',
                                suggestionFirst:          'react-autosuggest__suggestion--first',
                                suggestionHighlighted:    'react-autosuggest__suggestion--highlighted',
                                sectionContainer:         'react-autosuggest__section-container',
                                sectionContainerFirst:    'react-autosuggest__section-container--first',
                                sectionTitle:             'react-autosuggest__section-title'
                            }}
                        />
                        {cancelButton}
                        <div className="input-group-btn">
                            <button className="btn">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        
                    </div>
                </form>
            </div>
        );
    }
}
export default Search;

// <input type="search" placeholder="Nick, Hersteller, Modell..." value={this.state.searchTerm} onChange={this.handleSearchTermChange} />