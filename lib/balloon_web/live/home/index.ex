defmodule BalloonWeb.HomeLive.Index do
  use BalloonWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:video_chunks, [])

    # |> attach_hook(:Webcam, :handle_event, fn _event, _params, st ->
    #   IO.inspect({_event, _params})
    #   {:cont, st}
    # end)

    {:ok, socket}
  end

  @impl true
  def handle_params(_params, _url, socket) do
    IO.inspect({_params, _url})
    {:noreply, socket}
  end

  @impl true
  def handle_event("new_chunk", value, socket) do
    {:noreply, push_event(socket, "video_chunks", %{value: value})}
  end

  @impl true
  def handle_event(event, value, socket) do
    IO.inspect({event, value})

    File.write!("test.mp4", value)
    {:noreply, socket}
  end

  def handle_info(data, socket) do
    IO.inspect(data)
    {:noreply, socket}
  end
end
