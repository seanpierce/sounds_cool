class Sequence < ApplicationRecord
  validates :title, :data, :width, :speed, presence: true
  validates :speed, :width, numericality: true
  validates :data, length: { is: 256 }
  validates :data, format: {
    with: /[01]{256}/,
    message: "can only contain 0s or 1s"
  }
end
