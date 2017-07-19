class Seed

  def self.begin
    seed = Seed.new
    seed.generate_empty_pattern
  end

  def generate_empty_pattern
    Sequence.create!(
    title: "empty pattern",
    data: "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    width: 16,
    speed: 300
    )
  end

  def gimme_data
    i = ""
    256.times{|t| r = Random.new; i << r.rand(0..1).to_s}
    i
  end

  def create_sequences
    10.times do |n|
      Sequence.create!(
      title: "Sequence #{n + 1}",
      data: gimme_data,
      width: 16,
      speed: 300
      )
    end
  end

end

Seed.begin
