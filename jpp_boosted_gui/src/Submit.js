import React from 'react';
import Autosuggest from 'react-autosuggest';

import SubmitStage from './SubmitStage';

import './Submit.css';

async function getManuSuggestions(value) {
    if (value === undefined || value.value === undefined)
        return [];

    var prom = await fetch("/api/carmanufacturers?name=" + value.value)
        .then(r => r.json())
        .then(json => json)
        .catch(e => console.log(e));

    if (prom === null)
        return [];
    return prom;
};

async function getManuModelsSuggestions(manu, value) {
    if (manu === undefined || value === undefined || value.value === undefined)
        return [];

    var prom = await fetch(`/api/carmanufacturers/${manu.id}/models?name=${value.value}`)
        .then(r => r.json())
        .then(json => json)
        .catch(e => console.log(e));

    if (prom === null)
        return [];
    return prom;
};

class Submit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0,
            title: "",
            manufacturer: "",
            model: "",
            buildYear: "",
            imageUrl: "",
            // tuning: [this.getNewTuning()],
            tuning: [],
            selectedManufacturer: undefined,
            possibleManufacturers: [],
            manuValue: "",
            selectedModel: undefined,
            possibleModels: [],
            modelValue: ""
        }

        if (this.props.match.params.id !== undefined) {
            fetch(`/api/projects/${this.props.match.params.id}/include`)
                .then(r => r.json())
                .then(json => {
                    console.log(json);
                    this.setState({ id: json.id, tuning: json.tunings, title: json.title, buildYear: json.buildYear, imageUrl: json.projImageUrl, selectedManufacturer: json.baseModel.manufacturer, selectedModel: json.baseModel });

                })
                .catch(e => console.log(e));
        }
    }

    getNewTuning() {
        return { id: 0, name: "", description: "", horsePower: "", torque: "", date: "", youtubeUrl: "", times: [], parts: [] };
    }

    handleUserInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        if (name === "manufacturer") {
            fetch("/api/carmanufacturers?name=" + e.target.value)
                .then(r => r.json())
                .then(json => console.log(json))
                .catch(e => console.log(e));
        }
        else if (name === "model") {

        }

        this.setState({ [name]: value });
    }

    addStage = (e) => {
        e.preventDefault();
        const tuning = this.state.tuning;
        tuning.push(this.getNewTuning());

        this.setState({ tuning: tuning });
    }

    tuningChanged = (index, value) => {
        const tunings = this.state.tuning.slice();
        tunings[index] = value;
        this.setState({ tuning: tunings });
    }

    onModelSelected = (value) => {
        const model = value;
        this.setState({ selectedModel: model });
        if (this.state.tuning.length === 0 && model !== undefined) {
            var t = this.getNewTuning();
            t.stage = "Werksangabe";
            t.torque = model.torque;
            t.horsePower = model.ps;
            t.times = [{ speedRange: "0-100", time: model.acceleration }];
            this.setState({ tuning: [t] });
        }
        // const model = this.state.possibleModels.find(m => m.buildSeries === value.newValue);
        // this.setState({ selectedModel: model, modelValue: value.newValue });
        // if (this.state.tuning.length === 0 && model !== undefined) {
        //     var t = this.getNewTuning();
        //     t.stage = "Werksangabe";
        //     t.torque = model.torque;
        //     t.horsePower = model.ps;
        //     t.times = [{ speedRange: "0-100", time: model.acceleration }];
        //     console.log(t);
        //     this.setState({ tuning: [t] });
        // }

        // getManuModelsSuggestions(this.state.selectedManufacturer, value.newValue).then(models => this.setState({ possibleModels: models }));
    }

    onModelChange = (event, value) => {
        // const model = this.state.possibleModels.find(m => m.buildSeries === value.newValue);
        this.setState({ selectedModel: undefined, modelValue: value.newValue });

        getManuModelsSuggestions(this.state.selectedManufacturer, value.newValue).then(models => this.setState({ possibleModels: models }));
    }

    onManuChange = (event, value) => {
        this.setState({ selectedManufacturer: this.state.possibleManufacturers.find(m => m.name === value.newValue), manuValue: value.newValue, selectedModel: undefined, modelValue: "" });
        getManuSuggestions(value.newValue).then(manus => this.setState({ possibleManufacturers: manus }));
    }

    postNewProject = (e) => {
        e.preventDefault();

        var project = {
            id: this.state.id,
            carmodelid: this.state.selectedModel.id,
            title: this.state.title,
            buildYear: parseInt(this.state.buildYear, 10),
            imageUrl: this.state.imageUrl,
            tunings: this.state.tuning.map(t => {
                var temp = {
                    id: t.id,
                    stage: t.stage,
                    description: t.description,
                    horsePower: parseInt(t.horsePower, 10),
                    torque: parseInt(t.torque, 10),
                    date: t.date,
                    youtubeUrl: t.youtubeUrl,
                    parts: [],
                    times: [],
                };

                if (t.parts != null) {
                    temp.parts = t.parts.map(p => {
                        return { id: p.id, name: p.name, url: p.url, manufacturer: p.manufacturer, manufacturerUrl: p.manufacturerUrl };
                    });
                }
                if (t.times != null) {
                    temp.times = t.times.map(mt => {
                        return { id: mt.id, speedRange: mt.speedRange, time: parseFloat(mt.time) };
                    });
                }

                return temp;
            })
        };

        console.log(JSON.stringify(project));

        fetch("/api/projects", {
            method: "POST",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        })
            .then(res => res.json())
            .then(json => console.log(json));
    }

    render() {
        var stages = "";
        if (this.state.tuning.length > 0) {
            stages = this.state.tuning.map((t, i) => {
                return (
                    <div key={"divTuning" + i}>
                        <hr />
                        <SubmitStage key={"tuning" + i} index={i} tuning={t} onChange={this.tuningChanged} />
                    </div>
                );
            });
        }
        var umbauten = "";
        if (this.state.selectedManufacturer !== undefined && this.state.selectedModel !== undefined) {
            umbauten = (<div>
                <h4>Umbauten</h4>
                <button className="btn btn-primary" onClick={this.addStage}>
                    + Umbau hinzufügen
                </button>
                {stages}
                <hr />
                <button type="submit" className="btn btn-primary" onClick={this.postNewProject}>
                    Absenden
                </button>
            </div>);
        }

        const autoSuggestTheme = {
            container: "react-autosuggest__container",
            containerOpen: 'react-autosuggest__container--open',
            input: "submit-react-autosuggest__input",
            inputOpen: 'react-autosuggest__input--open',
            inputFocused: 'react-autosuggest__input--focused',
            suggestionsContainer: 'react-autosuggest__suggestions-container',
            suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
            suggestionsList: 'react-autosuggest__suggestions-list',
            suggestion: 'react-autosuggest__suggestion',
            suggestionFirst: 'react-autosuggest__suggestion--first',
            suggestionHighlighted: 'react-autosuggest__suggestion--highlighted',
            sectionContainer: 'react-autosuggest__section-container',
            sectionContainerFirst: 'react-autosuggest__section-container--first',
            sectionTitle: 'react-autosuggest__section-title'
        };

        return (
            <form>
                <h2>Neues Fahrzeug</h2>
                <div className="form-group">
                    <label className="keyName" htmlFor="title">Titel</label>
                    <input className="submit-react-autosuggest__input" type="text" name="title" placeholder="BMW V8"
                        value={this.state.title}
                        onChange={this.handleUserInput} />
                </div>

                <div className="form-group">
                    <div className="divFlex">
                        <div>
                            <label className="keyName" htmlFor="manufacturer">Hersteller</label>
                        </div>
                        <Autosuggest
                            id="manufacturer"
                            suggestions={this.state.possibleManufacturers}
                            onSuggestionsFetchRequested={(value) => {
                                getManuSuggestions(value).then(manus => this.setState({ possibleManufacturers: manus }));
                            }}
                            onSuggestionsClearRequested={() => this.setState({ possibleManufacturers: [] })}
                            getSuggestionValue={(item) => item.name}
                            renderSuggestion={(item) => (
                                <div>
                                    {item.name}
                                </div>)}
                            inputProps={{
                                placeholder: 'BMW',
                                value: this.state.manuValue,
                                onChange: this.onManuChange
                            }}
                            theme={autoSuggestTheme}
                        />
                    </div>
                    <div className="divFlex">
                        <div>
                            <label className="keyName" htmlFor="model">Model</label>
                        </div>
                        <Autosuggest
                            id="model"
                            suggestions={this.state.possibleModels}
                            onSuggestionsFetchRequested={(value) => {
                                getManuModelsSuggestions(this.state.selectedManufacturer, value).then(models => this.setState({ possibleModels: models }));
                            }}
                            onSuggestionsClearRequested={() => this.setState({ possibleModels: [] })}
                            getSuggestionValue={(item) => `${item.buildSeries}`}
                            renderSuggestion={(item) => (
                                <div>
                                    {item.name} {item.type} ({item.seriesCode} - {item.buildStart} - {item.buildEnd})
                                </div>)}
                            onSuggestionSelected={(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
                                this.onModelSelected(suggestion);
                                }}
                            inputProps={{
                                placeholder: 'M3',
                                value: this.state.modelValue,
                                onChange: this.onModelChange,
                                disabled: !this.state.selectedManufacturer
                            }}
                            theme={autoSuggestTheme}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="keyName" htmlFor="buildYear">Baujahr</label>
                    <input className="submit-react-autosuggest__input" type="text" name="buildYear"
                        value={this.state.buildYear}
                        onChange={this.handleUserInput} />
                </div>
                <div className="form-group">
                    <label className="keyName" htmlFor="imageUrl">Bild Url</label>
                    <input className="submit-react-autosuggest__input" type="text" name="imageUrl"
                        value={this.state.imageUrl}
                        onChange={this.handleUserInput} />
                </div>
                {umbauten}
            </form>
        );
    }
}
// <input type="text" name="manufacturer" placeholder="BMW"
//                             value={this.state.manufacturer}
//                             onChange={this.handleUserInput} />
// <input type="text" name="model" placeholder="z.B M3"
//                             value={this.state.model}
//                             onChange={this.handleUserInput} />
export default Submit;
// <Autocomplete
//     inputProps={{ id: 'states-autocomplete' }}
//     wrapperStyle={{ position: 'relative', display: 'inline-block' }}
//     value={this.state.manuValue}
//     items={this.state.possibleManufacturers}
//     getItemValue={(item) => item.name}
//     onSelect={(value, item) => {
//         // set the menu to only the selected item
//         // this.setState({ selectedManufacturer: item, manuValue: value, possibleManufacturers: [item] });
//         this.setState({ selectedManufacturer: item, manuValue: value });
//         // or you could reset it to a default list again
//         getManuSuggestions(value).then(manus => this.setState({ possibleManufacturers: manus }));
//     }}
//     onChange={(event, value) => {
//         this.setState({ selectedManufacturer: this.state.possibleManufacturers.find(m => m.name === value), manuValue: value });
//         getManuSuggestions(value).then(manus => this.setState({ possibleManufacturers: manus }));
//     }}
//     renderMenu={children => (
//         <div className="menu">
//             {children}
//         </div>
//     )}
//     renderItem={(item, isHighlighted) => (
//         <div
//             className={`item ${isHighlighted ? 'item-highlighted' : ''}`}
//             key={item.abbr}
//         >{item.name}</div>
//     )}
// />