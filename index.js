async function main() {
    let state = {
        scene_num: 0,
        filters_shown: 0,

        annotations_shown: 1,

        age_bin_size: 10,

        filter_age_min: 0,
        filter_age_max: 100,

        filter_first_class: 1,
        filter_second_class: 1,
        filter_third_class: 1,

        filter_male: 1,
        filter_female: 1
    }

    const scene_ids = [
        "#intro-scene",
        "#gender-scene",
        "#class-scene",
        "#age-scene",
        "#passengers-scene",
        "#filter-scene"
    ]

    let data = await load_data();
    process_data(data);

    setup_controls(state, scene_ids, () => render_graphs(data, state));
    render_graphs(data, state);
}

function update_scenes(scene_ids, state) {
    d3.selectAll(".scene").style("display", "none");
    d3.select(scene_ids[state.scene_num]).style("display", "block");
    d3.select("#prev-button").property("disabled", state.scene_num === 0);
    if(state.scene_num === scene_ids.length - 1) {
        d3.select("#next-button").html("Restart With Filters")
    } else {
        d3.select("#next-button").html("Next Scene")
    }
    if(scene_ids[state.scene_num] === "#filter-scene") {
        state.filters_shown = 1;
        state.annotations_shown = 0;
    }
    d3.select("#filter-options").style("display", state.filters_shown ? "block" : "none");
}

function filter_data(data, state) {
    return data.filter(d => d.Age >= state.filter_age_min && d.Age <= state.filter_age_max)
        .filter(d => d.Pclass === 1 && state.filter_first_class || d.Pclass === 2 && state.filter_second_class || d.Pclass === 3 && state.filter_third_class)
        .filter(d => d.Sex === "male" && state.filter_male || d.Sex === "female" && state.filter_female);
}

function setup_controls(state, scene_ids, on_change) {
    const age_slider = document.querySelector("#age-slider");
    const age_num = document.querySelector("#age-slider-num");

    age_slider.value = state.age_bin_size;
    age_num.textContent = state.age_bin_size;

    age_slider.addEventListener("input", event => {
        state.age_bin_size = event.target.value;
        age_num.textContent = state.age_bin_size;
        on_change();
    });

    const max_age_slider = document.querySelector("#age-filter-max-slider");
    const max_age_num = document.querySelector("#age-filter-max-slider-num");

    const min_age_slider = document.querySelector("#age-filter-min-slider");
    const min_age_num = document.querySelector("#age-filter-min-slider-num");


    max_age_slider.value = state.filter_age_max;
    max_age_num.textContent = state.filter_age_max;

    max_age_slider.addEventListener("input", event => {
        state.filter_age_max = Math.max(event.target.value, state.filter_age_min);
        max_age_num.textContent = state.filter_age_max;
        max_age_slider.value = state.filter_age_max;
        on_change();
    });

    min_age_slider.value = state.filter_age_min;
    min_age_num.textContent = state.filter_age_min;

    min_age_slider.addEventListener("input", event => {
        state.filter_age_min = Math.min(event.target.value, state.filter_age_max);
        min_age_num.textContent = state.filter_age_min;
        min_age_slider.value = state.filter_age_min;
        on_change();
    });

    const first_class = document.querySelector("#first-class-filter");
    first_class.checked = state.filter_first_class;

    first_class.addEventListener("input", event => {
        const is_checked = event.target.checked;
        const would_uncheck_all = !is_checked && !state.filter_second_class && !state.filter_third_class;
        if(would_uncheck_all) {
            state.filter_first_class = 1;
            event.target.checked = state.filter_first_class;
        } else {
            state.filter_first_class = is_checked;
            on_change();
        }
    })

    const second_class = document.querySelector("#second-class-filter");
    second_class.checked = state.filter_second_class;

    second_class.addEventListener("input", event => {
        const is_checked = event.target.checked;
        const would_uncheck_all = !is_checked && !state.filter_first_class && !state.filter_third_class;
        if(would_uncheck_all) {
            state.filter_second_class = 1;
            event.target.checked = state.filter_second_class;
        } else {
            state.filter_second_class = is_checked;
            on_change();
        }
    })

    const third_class = document.querySelector("#third-class-filter");
    third_class.checked = state.filter_third_class;

    third_class.addEventListener("input", event => {
        const is_checked = event.target.checked;
        const would_uncheck_all = !is_checked && !state.filter_first_class && !state.filter_second_class;
        if(would_uncheck_all) {
            state.filter_third_class = 1;
            event.target.checked = state.filter_third_class;
        } else {
            state.filter_third_class = is_checked;
            on_change();
        }
    })

    const male_filter = document.querySelector("#male-filter");
    male_filter.checked = state.filter_male;

    male_filter.addEventListener("input", event => {
        const is_checked = event.target.checked;
        const would_uncheck_all = !is_checked && !state.filter_female;
        if(would_uncheck_all) {
            state.filter_male = 1;
            event.target.checked = state.filter_male;
        } else {
            state.filter_male = is_checked;
            on_change();
        }
    })

    const female_filter = document.querySelector("#female-filter");
    female_filter.checked = state.filter_female;

    female_filter.addEventListener("input", event => {
        const is_checked = event.target.checked;
        const would_uncheck_all = !is_checked && !state.filter_male;
        if(would_uncheck_all) {
            state.filter_female = 1;
            event.target.checked = state.filter_female;
        } else {
            state.filter_female = is_checked;
            on_change();
        }
    })

    const next_button = document.querySelector("#next-button");
    const prev_button = document.querySelector("#prev-button");

    update_scenes(scene_ids, state);

    next_button.addEventListener("click", event => {
        state.scene_num = ++state.scene_num % scene_ids.length;
        console.log(state.scene_num);
        update_scenes(scene_ids, state);
        on_change();
    })

    prev_button.addEventListener("click", event => {
        state.scene_num = Math.max(--state.scene_num, 0);
        console.log(state.scene_num);
        update_scenes(scene_ids, state);
        on_change();
    })
}

function render_graphs(data, state) {
    let filtered_data = filter_data(data, state);
    render_overview_graph(filtered_data);
    render_gender_graph(filtered_data, state);
    render_class_graph(filtered_data, state);
    render_age_graph(filtered_data, state);
    render_passenger_id_graph(filtered_data);
}

async function load_data() {
    let data;

    try {
        document.getElementById("data-status").innerText = "Loading Titanic dataset...";
        const start = performance.now();

        const dataset_url = "https://fortisvar.github.io/Narrative-Visualization/titanic.csv";
        data = await d3.csv(dataset_url);

        console.log(data);
        console.log(data.length);

        const end = performance.now();
        document.getElementById("data-status").innerText = `Successfully loaded Titanic dataset in ${(end - start).toFixed(1)}ms`;
    } catch (error){
        console.error(error);
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

    const tooltip = d3.select("#tooltip");

    graph.select("#total-passengers").attr("r", scale_r(total_passengers)).attr("cx", scale_x(0)).attr("cy", height / 2)
        .attr("opacity", 1)
        .on("mouseenter", (event) => {
            tooltip.style("opacity", 1).html(`${total_passengers} Passengers<br>100.0%`);
            graph.select("#total-passengers").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-deaths").transition().duration(500).attr("opacity", 0.1);

            graph.select("#total-passengers-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors-text").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-deaths-text").transition().duration(500).attr("opacity", 0.1);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
            graph.select("#total-passengers").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths").transition().duration(500).attr("opacity", 1);

            graph.select("#total-passengers-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths-text").transition().duration(500).attr("opacity", 1);
        });
    graph.select("#total-survivors").attr("r", scale_r(total_survivors)).attr("cx", scale_x(1)).attr("cy", height / 2)
        .attr("opacity", 1)
        .on("mouseenter", (event) => {
            tooltip.style("opacity", 1).html(`${total_survivors} Survivors<br>${(total_survivors / total_passengers * 100).toFixed(1)}%`);
            graph.select("#total-passengers").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-survivors").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths").transition().duration(500).attr("opacity", 0.1);

            graph.select("#total-passengers-text").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-survivors-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths-text").transition().duration(500).attr("opacity", 0.1);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
            graph.select("#total-passengers").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths").transition().duration(500).attr("opacity", 1);

            graph.select("#total-passengers-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths-text").transition().duration(500).attr("opacity", 1);
        });
    graph.select("#total-deaths").attr("r", scale_r(total_deaths)).attr("cx", scale_x(2)).attr("cy", height / 2)
        .attr("opacity", 1)
        .on("mouseenter", (event) => {
            tooltip.style("opacity", 1).html(`${total_deaths} Deaths<br>${(total_deaths/total_passengers*100).toFixed(1)}%`);
            graph.select("#total-passengers").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-survivors").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-deaths").transition().duration(500).attr("opacity", 1);

            graph.select("#total-passengers-text").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-survivors-text").transition().duration(500).attr("opacity", 0.1);
            graph.select("#total-deaths-text").transition().duration(500).attr("opacity", 1);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
            graph.select("#total-passengers").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths").transition().duration(500).attr("opacity", 1);

            graph.select("#total-passengers-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-survivors-text").transition().duration(500).attr("opacity", 1);
            graph.select("#total-deaths-text").transition().duration(500).attr("opacity", 1);
        });

    graph.select("#total-passengers-text").text(`${total_passengers} Passengers`).attr("x", scale_x(0)).attr("y", height / 2).attr("font-size", scale_r(total_passengers) / 5).attr("opacity", 1);
    graph.select("#total-survivors-text").text(`${total_survivors} Survivors`).attr("x", scale_x(1)).attr("y", height / 2).attr("font-size", scale_r(total_survivors) / 5).attr("opacity", 1);
    graph.select("#total-deaths-text").text(`${total_deaths} Deaths`).attr("x", scale_x(2)).attr("y", height / 2).attr("font-size", scale_r(total_deaths) / 5).attr("opacity", 1);
}

function render_gender_graph(data, state) {
    const total_male_filter = data.filter(d => d.Sex === "male");
    const total_female_filter = data.filter(d => d.Sex === "female");

    const total_male_survivors = total_male_filter.filter(d => d.Survived === 1).length;
    const total_female_survivors = total_female_filter.filter(d => d.Survived === 1).length;

    const total_male_deaths = total_male_filter.filter(d => d.Survived === 0).length;
    const total_female_deaths = total_female_filter.filter(d => d.Survived === 0).length;

    const total_male = total_male_filter.length;
    const total_female = total_female_filter.length;

    const graph = d3.select("#gender-graph");
    graph.selectAll("*").remove();
    const width = graph.node().getBoundingClientRect().width;
    const height = graph.node().getBoundingClientRect().height;
    const margin_width = 0.1 * width;
    const margin_height = 0.1 * height;

    const deaths_data = [
        {label: "Total Deaths", value: total_male_deaths + total_female_deaths},
        {label: "Male Deaths", value: total_male_deaths},
        {label: "Female Deaths", value: total_female_deaths}
    ];

    const survivors_data = [
        {label: "Total Survivors", value: total_male_survivors + total_female_survivors},
        {label: "Male Survivors", value: total_male_survivors},
        {label: "Female Survivors", value: total_female_survivors}
    ];

    const labels = [
        "Total",
        "Males",
        "Females"
    ];

    const bar_width = 100;

    const max_y = total_male + total_female;

    const scale_x = d3.scaleBand().domain(labels).range([0, width-2*margin_width]);
    const scale_y = d3.scaleLinear().domain([0, max_y]).range([0, height-2*margin_height]);
    const axis_y = d3.scaleLinear().domain([0, max_y]).range([height-2*margin_height, 0]);

    const tooltip = d3.select("#tooltip");

    if(state.annotations_shown) {
        graph.append("text").attr("class", "annotation").text("Males had more deaths than females proportionally").attr("x", width / 3).attr("y", height / 15);
    }

    if(max_y !== 0) {
        const survivor_rects = graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(survivors_data).enter().append("rect");
        const death_rects = graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(deaths_data).enter().append("rect")

        survivor_rects.attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth() / 2 - bar_width / 2)
            .attr("y", d => -scale_y(d.value))
            .attr("height", d => scale_y(d.value))
            .attr("width", bar_width)
            .attr("fill", "cornflowerblue")
            .attr("opacity", 1)
            .on("mouseenter", (event, d) => {
                tooltip.style("opacity", 1).html(`${d.label}:<br>${d.value}`);
                survivor_rects.filter(function () {
                    return this !== event.currentTarget
                }).transition().duration(500).attr("opacity", 0.1);
                death_rects.transition().duration(500).attr("opacity", 0.1);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
                survivor_rects.transition().duration(500).attr("opacity", 1);
                death_rects.transition().duration(500).attr("opacity", 1);
            });

        death_rects.attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth() / 2 - bar_width / 2)
            .attr("y", (d, i) => -scale_y(d.value) - scale_y(survivors_data[i].value))
            .attr("height", d => scale_y(d.value))
            .attr("width", bar_width)
            .attr("fill", "crimson")
            .attr("opacity", 1)
            .on("mouseenter", (event, d) => {
                tooltip.style("opacity", 1).html(`${d.label}:<br>${d.value}`);
                death_rects.filter(function () {
                    return this !== event.currentTarget
                }).transition().duration(500).attr("opacity", 0.1);
                survivor_rects.transition().duration(500).attr("opacity", 0.1);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
                death_rects.transition().duration(500).attr("opacity", 1);
                survivor_rects.transition().duration(500).attr("opacity", 1);
            });
    }

    graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).call(d3.axisBottom(scale_x).tickSizeOuter(0));
    graph.append("g").attr("transform", `translate(${margin_width}, ${margin_height})`).call(d3.axisLeft(axis_y));
}

function render_class_graph(data, state) {
    const class1 = data.filter(d => d.Pclass === 1);
    const class2 = data.filter(d => d.Pclass === 2);
    const class3 = data.filter(d => d.Pclass === 3);

    const class1_deaths = class1.filter(d => d.Survived === 0).length;
    const class2_deaths = class2.filter(d => d.Survived === 0).length;
    const class3_deaths = class3.filter(d => d.Survived === 0).length;

    const class1_survivors = class1.filter(d => d.Survived === 1).length;
    const class2_survivors = class2.filter(d => d.Survived === 1).length;
    const class3_survivors = class3.filter(d => d.Survived === 1).length;

    const graph = d3.select("#class-graph");
    graph.selectAll("*").remove();
    const width = graph.node().getBoundingClientRect().width;
    const height = graph.node().getBoundingClientRect().height;
    const margin_width = 0.1 * width;
    const margin_height = 0.1 * height;

    const deaths_data = [
        {label: "First class deaths", value: class1_deaths},
        {label: "Second class deaths", value: class2_deaths},
        {label: "Third class deaths", value: class3_deaths}
    ];

    const survivors_data = [
        {label: "First class survivors", value: class1_survivors},
        {label: "Second class survivors", value: class2_survivors},
        {label: "Third class survivors", value: class3_survivors}
    ];

    const labels = [
        "First Class",
        "Second Class",
        "Third Class"
    ];

    const bar_width = 100;

    const max_y = Math.max(class1.length, class2.length, class3.length);

    const scale_x = d3.scaleBand().domain(labels).range([0, width-2*margin_width]);
    const scale_y = d3.scaleLinear().domain([0, max_y]).range([0, height-2*margin_height]);
    const axis_y = d3.scaleLinear().domain([0, max_y]).range([height-2*margin_height, 0]);

    const tooltip = d3.select("#tooltip");

    if(state.annotations_shown) {
        graph.append("text").attr("class", "annotation").text("Higher classes have better rates of survival").attr("x", width / 3).attr("y", height / 15);
    }

    if(max_y !== 0) {
        const survivor_rects = graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(survivors_data).enter().append("rect");
        const death_rects = graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(deaths_data).enter().append("rect")

        survivor_rects.attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth() / 2 - bar_width / 2)
            .attr("y", d => -scale_y(d.value))
            .attr("height", d => scale_y(d.value))
            .attr("width", bar_width)
            .attr("fill", "cornflowerblue")
            .attr("opacity", 1)
            .on("mouseenter", (event, d) => {
                tooltip.style("opacity", 1).html(`${d.label}:<br>${d.value}`);
                survivor_rects.filter(function () {
                    return this !== event.currentTarget
                }).transition().duration(500).attr("opacity", 0.1);
                death_rects.transition().duration(500).attr("opacity", 0.1);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
                survivor_rects.transition().duration(500).attr("opacity", 1);
                death_rects.transition().duration(500).attr("opacity", 1);
            });

        death_rects.attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth() / 2 - bar_width / 2)
            .attr("y", (d, i) => -scale_y(d.value) - scale_y(survivors_data[i].value))
            .attr("height", d => scale_y(d.value))
            .attr("width", bar_width)
            .attr("fill", "crimson")
            .attr("opacity", 1)
            .on("mouseenter", (event, d) => {
                tooltip.style("opacity", 1).html(`${d.label}:<br>${d.value}`);
                death_rects.filter(function () {
                    return this !== event.currentTarget
                }).transition().duration(500).attr("opacity", 0.1);
                survivor_rects.transition().duration(500).attr("opacity", 0.1);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
                death_rects.transition().duration(500).attr("opacity", 1);
                survivor_rects.transition().duration(500).attr("opacity", 1);
            });
    }
    graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).call(d3.axisBottom(scale_x).tickSizeOuter(0));
    graph.append("g").attr("transform", `translate(${margin_width}, ${margin_height})`).call(d3.axisLeft(axis_y));
}

function bin_by_age(data, bin_size) {
    const max_bins = d3.max(data, d => Math.floor(d.Age / bin_size)) + 1;
    const bins = Array.from({ length: max_bins });
    for (let i = 0; i < bins.length; i++) {
        bins[i] = {label: `${i * bin_size}-${(i + 1) * bin_size - 1}`,
                   value: []};
    }
    for (let i = 0; i < data.length; i++) {
        let bin_i = Math.floor(data[i].Age / bin_size);
        bins[bin_i].value.push(data[i]);
    }
    return bins
}

function render_age_graph(data, state) {
    const max_age = data.reduce((a, b) => Math.max(a, b.Age), 0);
    const min_bin = Math.ceil((max_age + 1) / 35);
    const slider = d3.select("#age-slider");
    const slider_num = d3.select("#age-slider-num");
    state.age_bin_size = Math.max(min_bin, state.age_bin_size);
    slider.attr("min", min_bin);
    slider.attr("value", state.age_bin_size);
    slider_num.html(state.age_bin_size);

    const age_data = bin_by_age(data, state.age_bin_size);
    const age_deaths = age_data.map(d => ({...d, value: d.value.filter(person => person.Survived === 0)}));
    const age_survivors = age_data.map(d => ({...d, value: d.value.filter(person => person.Survived === 1)}));
    const age_total_deaths = age_deaths.map(d => ({...d, value: d.value.length}))
    const age_total_survivors = age_survivors.map(d => ({...d, value: d.value.length}))

    const graph = d3.select("#age-graph");
    graph.selectAll("*").remove();
    const width = graph.node().getBoundingClientRect().width;
    const height = graph.node().getBoundingClientRect().height;
    const margin_width = 0.1 * width;
    const margin_height = 0.1 * height;

    // slider.attr("min", min_bin).property("value", state.age_bin).dispatch("input");

    const labels = age_data.map(d => d.label);

    const max_y = age_data.reduce((a, b) => Math.max(a, b.value.length), 0);

    const scale_x = d3.scaleBand().domain(labels).range([0, width-2*margin_width]);

    const scale_y = d3.scaleLinear().domain([0, max_y]).range([0, height-2*margin_height]);
    const axis_y = d3.scaleLinear().domain([0, max_y]).range([height-2*margin_height, 0]);

    const bar_width = (scale_y.range()[1] - scale_y.range()[0]) / age_data.length;

    const tooltip = d3.select("#tooltip");

    if(state.annotations_shown) {
        graph.append("text").attr("class", "annotation").text("Younger passengers have better survival rates").attr("x", width / 3).attr("y", height / 15);
    }

    const death_rects = graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(age_total_deaths).enter().append("rect");
    const survivor_rects = graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).selectAll("rect").data(age_total_survivors).enter().append("rect");

    survivor_rects.attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth()/2 - bar_width/2)
        .attr("y", d => -scale_y(d.value))
        .attr("height", d => scale_y(d.value))
        .attr("width", bar_width)
        .attr("fill", "cornflowerblue")
        .attr("opacity", 1)
        .on("mouseenter", (event, d) => {
            tooltip.style("opacity", 1).html(`Survivors ${d.label}:<br>${d.value}`);
            survivor_rects.filter(function() { return this !== event.currentTarget }).transition().duration(500).attr("opacity", 0.1);
            death_rects.transition().duration(500).attr("opacity", 0.1);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
            survivor_rects.transition().duration(500).attr("opacity", 1);
            death_rects.transition().duration(500).attr("opacity", 1);
        });

    death_rects.attr("x", (d, i) => scale_x(labels[i]) + scale_x.bandwidth()/2 - bar_width/2)
        .attr("y", (d, i) => -scale_y(d.value) - scale_y(age_total_survivors[i].value))
        .attr("height", d => scale_y(d.value))
        .attr("width", bar_width)
        .attr("fill", "crimson")
        .attr("opacity", 1)
        .on("mouseenter", (event, d) => {
            tooltip.style("opacity", 1).html(`Deaths ${d.label}:<br>${d.value}`);
            death_rects.filter(function() { return this !== event.currentTarget }).transition().duration(500).attr("opacity", 0.1);
            survivor_rects.transition().duration(500).attr("opacity", 0.1);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
            death_rects.transition().duration(500).attr("opacity", 1);
            survivor_rects.transition().duration(500).attr("opacity", 1);
        });

    graph.append("g").attr("transform", `translate(${margin_width}, ${height - margin_height})`).call(d3.axisBottom(scale_x).tickSizeOuter(0));
    graph.append("g").attr("transform", `translate(${margin_width}, ${margin_height})`).call(d3.axisLeft(axis_y));
}

function render_passenger_id_graph(data) {
    const box_size = 15;

    const graph = d3.select("#passenger-graph");
    graph.selectAll("*").remove();

    const width = graph.node().getBoundingClientRect().width;
    const height = graph.node().getBoundingClientRect().height;
    const margin_width = 0.1 * width;
    const margin_height = 0.1 * height;

    const tooltip = d3.select("#tooltip");

    const row_density = 45;

    const scale_x = d3.scaleLinear().domain([0, row_density - 1]).range([0, width - 2*margin_width]);
    const scale_y = d3.scaleLinear().domain([0, row_density - 1]).range([0, width - 2*margin_width]);

    const rects = graph.append("g").attr("transform", `translate(${margin_width}, ${margin_height})`).selectAll("rect").data(data).enter().append("rect");
    rects.attr("width", box_size)
        .attr("height", box_size)
        .attr("x", (d, i) => scale_x(i % row_density))
        .attr("y", (d, i) => scale_y(Math.floor(i / row_density)))
        .attr("fill", d => {
            if (d.Survived === 1) {
                return "cornflowerblue";
            } else if (d.Survived === 0) {
                return "crimson"
            }
        })
        .attr("opacity", 1)
        .on("mouseenter", (event, d) => {
            tooltip.style("opacity", 1).html(`${d.Name}<br>${d.Sex === "male" ? "Male" : "Female"}<br>${(d.Survived ? "Survived" : "Deceased")}<br>${d.Age} yrs<br>Passenger Id: ${d.PassengerId}`);
            rects.filter(function() { return this !== event.currentTarget }).transition().duration(500).attr("opacity", 0.1);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
            rects.transition().duration(500).attr("opacity", 1);
        })
}

main();

