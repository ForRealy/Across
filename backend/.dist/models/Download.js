import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
class Download extends Model {
}
Download.init({
    idDownload: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    idGame: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    download_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('pending', 'downloading', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    download_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'downloads',
    timestamps: false, // Evita `createdAt` y `updatedAt`
});
export default Download;
