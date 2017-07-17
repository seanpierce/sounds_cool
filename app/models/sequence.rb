class Sequence < ApplicationRecord
  validates :title, :data, :width, :speed, presence: true
end
