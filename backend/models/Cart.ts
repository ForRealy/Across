import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Cart extends Model {
  public id!: number;
  public user_id!: number;
  public game_id!: number;
  public quantity!: number;
  public created_at!: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Cart',
    tableName: 'addtocart',
    timestamps: false,
  }
);

export default Cart; 