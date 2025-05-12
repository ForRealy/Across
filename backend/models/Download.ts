import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Download extends Model {
  public idDownload!: number;
  public idUser!: number;
  public idGame!: number;
  public download_date!: Date;
  public status!: 'pending' | 'downloading' | 'completed' | 'failed';
  public download_path!: string | null;
}

Download.init(
  {
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
  },
  {
    sequelize,
    tableName: 'downloads', // Asegura que use la tabla correcta
    timestamps: false, // Evita `createdAt` y `updatedAt`
  }
);

export default Download;
