class Sequence < ApplicationRecord
  validates :title, :data, :width, :speed, presence: true
  validates :speed, :width, numericality: true
  validates :data, length: { is: 64 }
  validates :data, format: {
    with: /[01]{64}/,
    message: "data can contain 0s or 1s"
  }
end
