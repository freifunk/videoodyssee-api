module.exports = (sequelize, Sequelize) => {
    const Video = sequelize.define("video", {
      title: {
        type: Sequelize.STRING
      },
      subtitle: {
        type: Sequelize.STRING
      },
      event: {
        type: Sequelize.STRING
      },
      language: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      }
    });
    return Video;
  };