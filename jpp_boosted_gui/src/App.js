import React, { Component } from 'react';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import Search from './Search';
import ProjectOverview from './ProjectOverview';
import Home from './Home';
import Privacy from './Privacy';
import Submit from './Submit';
import About from './About';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: []
    };

    var match = new RegExp("/search/(.+)", "i").exec(window.location.href);
    if (match != null) {
      fetch("/api/projects/include?search=" + match[1])
        .then(resp => resp.json())
        .then(data => {
          this.setState({ projects: data });

        })
        .catch(e => console.log(e));
      // getProjects(match[1]).then(p => this.setState({ projects: p }));
    }
  }

  performSearch(t) {
    window.location = "/search/" + t;
  }

  render() {
    // let docId = 0;
    var match = new RegExp("/search/(.+)", "i").exec(window.location.href);
    if (match != null) {
      // const projects = getVideos().filter(v => v.baseModel.manufacturer.toLowerCase().indexOf(match[1]) > -1).map(p => {
      //   return (
      //     <ProjectOverview key={"project" + p.id} project={p} />
      //   );
      // });
      var projects = "";
      
      if(this.state.projects !== undefined) {
        projects = this.state.projects.map(p => {
          return (
            <ProjectOverview key={"project" + p.id} project={p} />
          );
        });
      }
      return (
        <div className="App">
          <Header />
          <div className="jpp-content">
            <div className="container">
              <Search onSubmit={this.performSearch} searchTerm={match[1]} />
              {projects}
            </div>
          </div>
          <Footer />
        </div>
      );

    }

    if (window.location.href.indexOf("datenschutz") > 0) {
      return (
        <div className="App">
          <Header />
          <div className="jpp-content">
            <div className="container">
              <Privacy />
            </div>
          </div>
          <Footer />
        </div>
      );
    }

    if (window.location.href.indexOf("submit") > 0) {
      return (
        <div className="App">
          <Header />
          <div className="jpp-content">
            <div className="container">
              <Submit />
            </div>
          </div>
          <Footer />
        </div>
      );
    }

    if (window.location.href.indexOf("about") > 0) {
      return (
        <div className="App">
          <Header />
          <div className="jpp-content">
            <div className="container">
              <About />
            </div>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="App">
        <Header />
        <div className="jpp-content">
          <Home onSubmit={this.performSearch} />
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;

function getVideos() {
  return [
    {
      id: 1,
      title: "C63 AMG Tuning",
      modificationStart: 2016,
      modificationEnd: 2016,
      rating: 4.5,
      baseModel: {
        id: 1,
        manufacturer: "Mercedes-Benz",
        manufacturerUrl: "",
        model: "C63 AMG",
        manufactureDate: 2016,
        bodyType: "Hatchback",
        aspiration: "Turbo",
        transmission: "Manual",
        doors: 3,
        seats: 4,
        weigth: 1700,
        height: 200,
        width: 200,
        length: 473,
        drive: "rear-wheel",
        engine: {
          id: 1,
          vMax: 270,
          capacity: 3400,
          fuel: "petrol",
          cylinder: 8,
          buildTimeStart: 1999,
          buildTimeEnd: 2000,
        },
        tankCapacity: 63,
        wheelbase: 2735,
        maxWeight: 1785,
        emptyWeight: 0,
      },
      tuning: [
        {
          id: 1,
          stage: "Serie",
          description: "Herstellerangaben",
          horsePower: 563,
          powerWheels: 258,
          torque: 634,
          modificationDate: 2016,
          modifiedParts: [
          ],
          measuredTime: [
            {
              id: 1,
              speedRange: "0-200",
              time: "10.3",
              youtubeUrl: ""
            },
            {
              id: 2,
              speedRange: "0-100",
              time: "4.2",
              youtubeUrl: ""
            }
          ]
        },
        {
          id: 1,
          stage: "Stage 2",
          description: "Software, Krümmer",
          horsePower: 563,
          powerWheels: 258,
          torque: 634,
          modificationDate: 2016,
          modifiedParts: [
            {
              id: 1,
              part: "Krümmer",
              youtubeUrl: "",
              manufacturer: "Hersteller",
              manufacturerUrl: "",
              partUrl: ""
            }
          ],
          measuredTime: [
            {
              id: 1,
              speedRange: "0-200",
              time: "8.7",
              youtubeUrl: ""
            },
            {
              id: 2,
              speedRange: "0-100",
              time: "3.4",
              youtubeUrl: ""
            }
          ]
        }
      ]
    },
  ];
}