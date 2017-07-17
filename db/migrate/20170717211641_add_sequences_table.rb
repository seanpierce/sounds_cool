class AddSequencesTable < ActiveRecord::Migration[5.1]
  def change
    create_table :sequences do |t|
      t.column :data, :string
      t.column :title, :string
      t.column :speed, :integer
      t.column :width, :integer
    end
  end
end
