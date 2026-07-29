async function render_visualization() {
    let data = await load_data();
    process_data(data);
    render_overview_graph(data);
    render_gender_graph(data);
}

async function load_data() {
    let data;

    try {
        document.getElementById("data-status").innerText = "Loading Titanic dataset...";
        const start = performance.now();

        const dataset_url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv";
        data = await d3.csv(dataset_url);

        console.log(data);
        console.log(data.length);

        const end = performance.now();
        document.getElementById("data-status").innerText = `Successfully loaded Titanic dataset in ${(end - start).toFixed(1)}ms`;
    } catch {
        console.log("Failed to load CSV file");
        document.getElementById("data-status").innerText = "Failed to load Titanic dataset";
        document.getElementById("data-status").style.color = "red";
    }

    return data;
}

function process_data(data) {
    data.forEach(d => {
        d.PassengerId = +d.PassengerId;
        d.Survived = +d.Survived;
        d.Pclass = +d.Pclass;
        d.Age = +d.Age;
        d.SibSp = +d.SibSp;
        d.Parch = +d.Parch;
        d.Fare = +d.Fare;
    })
}

function render_overview_graph(data) {
    const total_passengers = data.length;
    const total_survivors = data.filter(d => d.Survived === 1).length;
    const total_deaths = data.filter(d => d.Survived === 0).length;

    const max_r = 150;
    const scale_r = d3.scaleSqrt().domain([0, total_passengers]).range([0, max_r]);

    const graph = d3.select("#overview-graph");
    const width = graph.node().getBoundingClientRect().width;
    const height = graph.node().getBoundingClientRect().height;
    const margin_width = 0.2 * width;
    const scale_x = d3.scaleLinear().domain([0, 2]).range([margin_width, width - margin_width]);

    graph.select("#total-passengers").attr("r", scale_r(total_passengers)).attr("cx", scale_x(0)).attr("cy", height / 2);
    graph.select("#total-survivors").attr("r", scale_r(total_survivors)).attr("cx", scale_x(1)).attr("cy", height / 2);
    graph.select("#total-deaths").attr("r", scale_r(total_deaths)).attr("cx", scale_x(2)).attr("cy", height / 2);

    graph.select("#total-passengers-text").text(`${total_passengers} Passengers`).attr("x", scale_x(0)).attr("y", height / 2).attr("font-size", scale_r(total_passengers) / 5);
    graph.select("#total-survivors-text").text(`${total_survivors} Survivors`).attr("x", scale_x(1)).attr("y", height / 2).attr("font-size", scale_r(total_survivors) / 5);
    graph.select("#total-deaths-text").text(`${total_deaths} Deaths`).attr("x", scale_x(2)).attr("y", height / 2).attr("font-size", scale_r(total_deaths) / 5);
}

function render_gender_graph(data) {
    const total_male_filter = data.filter(d => d.Sex === "male");
    const total_female_filter = data.filter(d => d.Sex === "female");

    const total_male_survivors = total_male_filter.filter(d => d.Survived === 1).length;
    const total_female_survivors = total_female_filter.filter(d => d.Survived === 1).length;

    const total_male_deaths = total_male_filter.filter(d => d.Survived === 0).length;
    const total_female_deaths = total_female_filter.filter(d => d.Survived === 0).length;

    const total_male = total_male_filter.length;
    const total_female = total_female_filter.length;

    const graph = d3.select("#gender-graph");
    const width = graph.node().getBoundingClientRect().width;
    const height = graph.node().getBoundingClientRect().height;
    const margin_width = 0.1 * width;
    const margin_height = 0.1 * height;

    const deaths_data = [
        {label: "Deaths", value: total_male_deaths + total_female_deaths},
        {label: "Male Deaths", value: total_male_deaths},
        {label: "Female Deaths", value: total_female_deaths}
    ];

    const survivors_data = [
        {label: "Survivors", value: total_male_survivors + total_female_survivors},
        {label: "Male Survivors", value: total_male_survivors},
        {label: "Female Survivors", value: total_female_survivors}
    ];

    const labels = [
        "Total",
        "Males",
        "Females"
    ];

    const bar_width = 100;


    const scale_x = d3.scaleBand().domain(labels).range([0, width-2*margin_width]);
    const scale_y = d3.scaleLinear().domain([0, total_male + total_female]).range([0, height-2*margin_height]);

    graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(survivors_data).enter().append("rect")
        .attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth()/2 - bar_width/2)
        .attr("y", d => -scale_y(d.value))
        .attr("height", d => scale_y(d.value))
        .attr("width", bar_width)
        .attr("fill", "cornflowerblue")
        .attr("stroke", "#2f4670")
        .attr("stroke-width", 5);

    graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(deaths_data).enter().append("rect")
        .attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth()/2 - bar_width/2)
        .attr("y", (d, i) => -scale_y(d.value) - scale_y(survivors_data[i].value))
        .attr("height", d => scale_y(d.value))
        .attr("width", bar_width)
        .attr("fill", "crimson")
        .attr("stroke", "#680b1d")
        .attr("stroke-width", 5);

    graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).call(d3.axisBottom(scale_x).tickSizeOuter(0));
    graph.append("g").attr("transform", `translate(${margin_width}, ${margin_height})`).call(d3.axisLeft(scale_y));
}

render_visualization();

