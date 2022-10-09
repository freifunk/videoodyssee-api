module.exports = (sequelize, Sequelize) => {
    const Video = sequelize.define("video", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING
      },
      subtitle: {
        type: Sequelize.STRING
      },
      persons: {
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.STRING
      },
      conference: {
        type: Sequelize.STRING
      },
      slug: {
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
      description: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      }
    });
    return Video;
  };