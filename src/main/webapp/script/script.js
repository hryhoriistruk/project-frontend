let countAccounts = 0;
let currentPageNumber = 0;
let pageSize = 3;

$(function () {
    updateDropDownList();
    updateAccountTable();
    updateCountAccounts();
});

function updateAccountTable() {
    $.get(`rest/players?pageNumber=${currentPageNumber}&pageSize=${pageSize}`, (players) => {
        let $tableBody = $("#player-table-body");
        $tableBody.empty();

        players.forEach((player) => {
            $tableBody.append(createRow(player));
        });
    });
}

function createRow(player) {
    return `<tr id="table-row-${player.id}">
            <td class="player-id">${player.id}</td>
            <td class="player-name" ">${player.name}</td>
            <td class="player-title">${player.title}</td>
            <td class="player-race">${player.race}</td>
            <td class="player-profession">${player.profession}</td>
            <td class="player-level">${player.level}</td>
            <td class="player-birthday">${new Date(player.birthday).toLocaleDateString()}</td>
            <td class="player-banned">${player.banned}</td>
            <td><button class="edit-button" onclick="updatePlayer(${player.id})"><img src="../img/edit.png"></button></td>
            <td><button class="delete-button" onclick="deletePlayer(${player.id})"><img src="../img/delete.png"></button></td>
        </tr>`;
}

function updateCountAccounts() {
    $.get("rest/players/count", (count) => {
        countAccounts = count;
        updatePagingButtons();
    });
}

function updatePagingButtons() {
    let $pagingButtons = $("#buttons-paging");
    $pagingButtons.empty();

    let buttonsCount = Math.ceil(countAccounts / pageSize);

    for (let i = 0; i < buttonsCount; i++) {
        let button = `<button value="${i}" onclick="PagingButtonEvent(${i})">${i + 1}</button>`;
        $pagingButtons.append(button);
    }
    setActiveButton();
}

function PagingButtonEvent(pageNumber = 0) {
    setActiveButton(pageNumber);

    currentPageNumber = pageNumber;
    updateAccountTable();
}

function setActiveButton(buttonIndex = 0) {
    const $buttons = document.querySelector("#buttons-paging");
    const $currentActiveButton = $buttons.children[currentPageNumber];

    if ($currentActiveButton) {
        $currentActiveButton.classList.remove('current-button-color');
    }
    $buttons.children[buttonIndex].classList.add('current-button-color');
}

function updateDropDownList() {
    let $dropDown = $("#dropDown-list");
    $dropDown.empty();

    let downList = dropDownList([3, 5, 8, 10, 20]);
    $dropDown.append(downList);
}

function dropDownList(values) {
    let options = '';
    values.forEach((value) => {
        let option = `<option value="${value}">${value}</option>`;
        options += option;
    });
    return options;
}

function updatePageSize(numbers) {
    pageSize = numbers;
    currentPageNumber = 0;
    updateAccountTable();
    updatePagingButtons();
}

function deletePlayer(id) {
    $.ajax({
        type: "DELETE",
        url: `/rest/players/${id}`,
        success: () => {
            updateAccountTable();
            updateCountAccounts();
            setActiveButton(currentPageNumber)
        }
    });
}

function updatePlayer(id) {
    const $row = $(`#table-row-${id}`);
    if ($row.length) {
        $row.find(".delete-button").remove();
        $row.find(".edit-button").replaceWith(`<button class="save-button" onclick="savePlayer(${id})"><img src="../img/save.png"></button>`);

        const name = $row.find(".player-name").text();
        const title = $row.find(".player-title").text();
        const race = $row.find(".player-race").text();
        const profession = $row.find(".player-profession").text();
        const banned = $row.find(".player-banned").text();

        const raceOptions = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
        const raceSelect = createDropDownSelect('race-select', id, raceOptions, race);

        const professionOptions = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
        const professionSelect = createDropDownSelect('profession-select', id, professionOptions, profession);

        const bannedOptions = ['true', 'false'];
        const bannedSelect = createDropDownSelect('banned-select', id, bannedOptions, banned);


        $row.find(".player-name").html(`<input type="text" id="name-input-${id}" value="${name}">`);
        $row.find(".player-title").html(`<input type="text" id="title-input-${id}" value="${title}">`);
        $row.find(".player-race").html(raceSelect);
        $row.find(".player-profession").html(professionSelect);
        $row.find(".player-banned").html(bannedSelect);
    }
}

function createDropDownSelect(name, id, options, selectedValue) {
    let select = `<select id="${name}-${id}">`;
    options.forEach(option => {
        const selected = option === selectedValue ? 'selected' : '';
        select += `<option value="${option}" ${selected}>${option}</option>`;
    });
    select += `</select>`;
    return select;
}

function savePlayer(id) {
    const name = $(`#name-input-${id}`).val();
    const title = $(`#title-input-${id}`).val();
    const race = $(`#race-select-${id}`).val();
    const profession = $(`#profession-select-${id}`).val();
    const banned = $(`#banned-select-${id}`).val();

    const data = {
        name: name,
        title: title,
        race: race,
        profession: profession,
        banned: banned
    }

    $.ajax({
        type: "POST",
        url: `rest/players/${id}`,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: () =>
            updateAccountTable()
    });
}

function createNewPlayer() {
    event.preventDefault()
    const name = $("#new-player-name").val();
    const title = $("#new-player-title").val();
    const race = $("#new-player-race").val();
    const profession = $("#new-player-profession").val();
    const level = Number($("#new-player-level").val());
    const birthday = new Date($("#new-player-birthday").val()).getTime();
    const banned = $("#new-player-banned").is(":checked");

    const data = {
        name: name,
        title: title,
        race: race,
        profession: profession,
        level: level,
        birthday: birthday,
        banned: banned
    }
    console.log(data)

    $.ajax({
        type: "POST",
        url: "rest/players",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: () => {
            updateAccountTable();
            updateCountAccounts();
        }
    })
}
