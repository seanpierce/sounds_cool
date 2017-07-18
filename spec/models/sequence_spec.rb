require 'rails_helper'

RSpec.describe Sequence, type: :model do
  it { should validate_presence_of :title }
  it { should validate_presence_of :data }
  it { should validate_presence_of :width }
  it { should validate_presence_of :speed }
  it { should validate_numericality_of :speed }
  it { should validate_numericality_of :width }
  it { should validate_length_of(:data).is_equal_to 64}
  it do
    should allow_values('0000000000000000000000000000000000000000000000000000000000000000', '1111111111111111111111111111111111111111111111111111111111111111')
    .for(:data)
  end
  it do
    should_not  allow_values('2000000000000000000000000000000000000000000000000000000000000000', '2111111111111111111111111111111111111111111111111111111111111111')
    .for(:data)
  end
end
