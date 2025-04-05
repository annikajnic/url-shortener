import { Table, Column, Model, DataType, Default } from 'sequelize-typescript'

@Table
export class URL extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  longUrl!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  shortUrl!: string

  @Column({ type: DataType.DATE })
  createdAt!: Date

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt!: Date

  @Default(0)
  @Column(DataType.INTEGER)
  accessCount!: number
}
