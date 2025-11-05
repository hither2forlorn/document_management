module.exports = (sequelize, type) => {
    return sequelize.define("reporting_iframe", {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        isDeleted: {
            type: type.STRING,
            defaultValue: false,
        },
        url: {
            type: type.STRING,
        },
        name: {
            type: type.STRING,
        },
        desc: {
            type: type.TEXT,
        },
    });
};
