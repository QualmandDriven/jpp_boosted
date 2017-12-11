import React from 'react';
import './Search.css';

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = { searchTerm: this.props.searchTerm };

        this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    handleSearchTermChange(e) {
        this.setState({
            searchTerm: e.target.value
        });
    }

    submit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state.searchTerm);
    }

    render() {
        return (
            <div>
                <h3>Gemessene Zeiten von modifizierten Autos der <a target="blank" href="https://www.jp-performance.de">JP Performance GmbH</a></h3>
                <form onSubmit={this.submit} id="search" className="Search">
                    <input type="search" placeholder="Search for a car..." value={this.state.searchTerm} onChange={this.handleSearchTermChange} />
                </form>
            </div>
        );
    }
}
export default Search;