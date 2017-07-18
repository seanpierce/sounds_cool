require 'rails_helper'

RSpec.describe Sequence, type: :model do
  it { should validate_presence_of :title }
  it { should validate_presence_of :data }
  it { should validate_presence_of :width }
  it { should validate_presence_of :speed }
  it { should validate_numericality_of :speed }
  it { should validate_numericality_of :width }
end
