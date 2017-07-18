class Sequence < ApplicationRecord
  validates :title, :data, :width, :speed, presence: true
  validates :speed, :width, numericality: true
  validates :data, length: { is: 64 }
end
