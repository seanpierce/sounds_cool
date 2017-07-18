class SequencesController < ApplicationController

  def index
    @sequences = Sequence.all
    json_response(@sequences)
  end

  def show
    sequence = Sequence.find(params[:id])
    json_response(sequence)
  end

  def create
    sequence = Sequence.create!(sequence_params)
    render status: 201, json: {
      message: "Sequence '#{sequence.title}' created successfully."
    }
    # json_response(sequence, :created)
  end

  def update
    sequence = Sequence.find(params[:id])
    sequence.update!(sequence_params)
    render status: 200, json: {
      message: "Sequence updated successfully."
    }
  end

  def destroy
    @sequence = Sequence.find(params[:id])
    @sequence.destroy
  end

  def count
    @count = Sequence.count
    json_response(@count)
  end

  private
  def sequence_params
    params.permit(:title, :data, :width, :speed)
  end

end
